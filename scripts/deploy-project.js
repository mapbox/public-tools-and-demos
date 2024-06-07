#!/usr/bin/env node

'use strict'

import fs from 'fs'
import path from 'path'
import AWS from 'aws-sdk'
import { execaCommand } from 'execa'
import { globbySync } from 'globby'
import meow from 'meow'
import PQueue from 'p-queue'
import mimeTypes from 'mime-types'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

// const env = process.env.TRAVIS_BRANCH;
const ENV_PRODUCTION = 'production'
const ENV_STAGING = 'staging'

const buckets = new Map()
buckets.set(ENV_PRODUCTION, 'labs.mapbox.com')
buckets.set(ENV_STAGING, 'labs.mapbox.com-staging')

const cliDescription = 'Deploy a demo production to the web.'
const cliHelp = `
  You should run "mbx env" before this command!

  Usage
    scripts/deploy-project.js <project> <env>

    The specified project and the index apps will be built
    and deployed.

  Arguments
    project   The name of the project. Must correspond to a
              subdirectory within the projects directory.
    env       'staging' | 'production'

  Examples
    scripts/deploy-project.js draw-circle staging
    scripts/deploy-project earthquake-tracker production
`

const cli = meow({
  description: cliDescription,
  help: cliHelp,
  importMeta: import.meta,
  flags: {
    verbose: {
      type: 'boolean',
      alias: 'V'
    }
  }
})

function errorOut(message) {
  console.error(`ERROR: ${message}`)
  cli.showHelp()
}

const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID
if (!awsAccessKeyId) {
  throw new Error('You must authenticate with the mbxcli command "mbx env"')
}

const args = cli.input
if (args.length !== 2) {
  errorOut('You must specify <project> and <env> arguments')
}

const project = args[0]
const env = args[1]

const s3Bucket = buckets.get(env)
if (!s3Bucket) {
  errorOut(`Unknown env "${env}"`)
}

const projectDir = path.join(__dirname, '../projects', project)
if (!fs.existsSync(projectDir)) {
  errorOut(`Unknown project "${project}"`)
}

const projectPkg = JSON.parse(
  fs.readFileSync(path.join(projectDir, 'package.json'))
)

const queue = new PQueue({
  concurrency: 20
})
const s3 = new AWS.S3()
const filesToSkip = new Set([
  'package.json',
  'package-lock.json',
  'yarn.lock',
  '.eslintrc',
  '.babelrc',
  'npm-debug.log',
  'README.md'
])

const verboseLog = (message) => {
  if (cli.flags.verbose) {
    console.log(message)
  }
}

function copyDirToS3(dir, createKey) {
  console.log(
    `Copying ${path.relative(path.join(__dirname, '..'), dir)}/ to S3 ...`
  )
  const putPromises = [Promise.resolve()]
  globbySync(path.join(dir, '**/*.*')).forEach((filename) => {
    const relativeFilename = path.relative(dir, filename)
    if (filesToSkip.has(relativeFilename)) {
      return
    }

    const putFile = () => {
      return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, content) => {
          if (err) {
            return reject(err)
          }
          let objectKey
          switch (env) {
            default:
              objectKey = `${createKey(relativeFilename)}`
              break
          }
          const params = {
            Bucket: s3Bucket,
            Key: objectKey,
            Body: content,
            CacheControl: 'max-age=120',
            ContentType:
              mimeTypes.lookup(filename) || 'application/octet-stream'
          }
          const request = s3.putObject(params)
          resolve(request.promise())
        })
      })
    }
    putPromises.push(queue.add(() => putFile()))
  })
  switch (env) {
    case 'staging':
      console.log(
        `Your Project will be available at https://labs.tilestream.net/${project}`
      )
      break
    default:
      console.log(
        `Your Project will be available at https://${s3Bucket}/${project}`
      )
      break
  }

  return Promise.all(putPromises).catch((err) => {
    if (err.code === 'ExpiredToken') {
      errorOut(
        'Your AWS token is expired. Run "mbx env" to generate a new one, then try again.'
      )
    } else {
      throw err
    }
  })
}

function buildProject() {
  console.log(`Building ${project} ...`)
  const buildDir = path.join(projectDir, 'dist')
  console.log('projectDir', projectDir)
  return execaCommand('yarn install', {
    cwd: projectDir
  })
    .then((result) => {
      verboseLog(result.stdout)
      return execaCommand('yarn build', {
        cwd: projectDir
      })
    })
    .then((result) => {
      verboseLog(result.stdout)
      if (!fs.existsSync(buildDir)) {
        throw new Error(
          `yarn build for ${project} did not create a build/ directory`
        )
      }
      return buildDir
    })
}

const deployProject = Promise.resolve()
  .then(() => {
    if (projectPkg.scripts && projectPkg.scripts.build) {
      return buildProject()
    } else {
      return projectDir
    }
  })
  .then((dirToCopy) => {
    return copyDirToS3(dirToCopy, (filename) => `${project}/${filename}`)
  })

Promise.all([deployProject]).catch((error) => {
  console.error(error)
})
