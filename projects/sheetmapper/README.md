# Mapbox Sheetmapper

An html and javascript template for quickly creating an [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js) interactive marker map with data sourced from a Google Sheet.

[Sample Code]() [Sample Google Sheet](https://docs.google.com/spreadsheets/d/1MiqwGe_7m6B0xFQfaS3GGRO8CmGm5xlXPICDPEeGHyo/edit?gid=0#gid=0) [Live Map Demo](https://labs.mapbox.com/sheetmapper/)

## How to Use

### Step 1. Create a Google Sheet

Sheetmapper works by using a publicly-accessible CSV download link for your Google Sheet. The sheet must include some specific column names which the code in sheetmapper users to convert each row into a map marker.

Create a new Google Sheet with the columns described below, and populate it with data.

#### Required Columns

At a minimum, you must provide a `Latitude` and `Longitude` for each row so that Sheetmapper knows where to place each marker on the map. For help finding latitudes and longitude coordinates for locations, try our [Location Helper](https://labs.mapbox.com/location-helper/) tool.

| Column Name | Description                         |
| ----------- | ----------------------------------- |
| `Longitude` | The wgs84 longitude of the location |
| `Latitude`  | The wgs84 latitude of the location  |

#### Optional Columns

Sheetmapper's default configuration displays a popup with `Name`, `Address`, and `Phone`. You can customize the popup to include any other columns from your sheet by editing the code, but these are the column names that will work without any additional coding.

| Column Name | Description                                                                         |
| ----------- | ----------------------------------------------------------------------------------- |
| `Name`      | The name of whatever is located at this location, for display in the popup's header |
| `Address`   | The address for this location, for display in the popup's body                      |
| `Phone`     | The phone number for this location, for display in the popup's body                 |

See our [Sample Google Sheet](https://docs.google.com/spreadsheets/d/1MiqwGe_7m6B0xFQfaS3GGRO8CmGm5xlXPICDPEeGHyo/edit?gid=0#gid=0) to see what a compatible sheet with the expected column names looks like.

{ image of template spreadsheet }

### Step 2. Publish your Google Sheet

Follow these steps to publish a Google Sheet and get a direct link to download it as a CSV file.

1. In your Google Sheet, go to **File > Share > Publish to web**.
2. In the **Publish to the web** dialog:
   - Select the sheet you want to share.
   - Under **Link**, choose **CSV** as the format.
3. Click **Publish** and confirm that you want to publish the document.
4. A URL will be generated. Copy it. You will need this URL to configure sheetmapper.

Your CSV download URL will look like this:
```
https://docs.google.com/spreadsheets/d/1dLkr70tfAL_-U6ipad9xLF39lHmU8k-xd08uKHkLD5M/gviz/tq?tqx=out:csv&sheet=Sheet1
```
You can confirm that it is working by trying it out in a web browser, it should trigger a CSV file download including the data from your sheet.

**Important Notes**
- Publishing to the web makes the document publicly accessible to anyone with the link. Use caution with sensitive information.
- If you update the Google Sheet, the CSV link will reflect those changes automatically.

### Step 3. Preview Sheetmapper locally

Follow these steps to download the Sheetmapper HTML file from GitHub, open it in Visual Studio Code, and view it in your browser.

#### 1: Find and Download the HTML File from GitHub
1. Go to the [Sheetmapper HTML file on github](https://github.com/mapbox/public-tools-and-demos/)
2. Click on the **Raw** button to view the raw HTML code.
3. Right-click on the page and select **Save as…** to save the HTML file to your computer.

#### 2: Open the HTML File in Visual Studio Code
1. Open **Visual Studio Code** on your computer.
2. Use **File > Open File…** or **File > Open Folder…** to open the Sheetmapper HTML file or the folder containing the Sheetmapper HTML file.
3. Once the file is open, you should see the HTML code in Visual Studio Code.

#### 3: Install the Live Server Extension
To make it easier to preview changes in real-time, you can install the Live Server extension in Visual Studio Code:
1. Go to the **Extensions** tab in Visual Studio Code (the square icon on the sidebar).
2. Search for **Live Server** and click **Install**.
3. Once installed, you’ll be able to start a live server to preview the HTML file.

#### 4: Run the HTML File in Your Browser
1. With the HTML file open, right-click in the editor window and select **Open with Live Server**.
2. Your default browser will open, displaying the HTML page. Any changes you make and save will automatically refresh in the browser. You will see a browser alert with an error if you have not yet configured Sheetmapper.

## Troubleshooting Tips
- Ensure that **Live Server** is properly installed and enabled if using the live preview.
- If the file does not open in your browser, check the file path or try opening it manually by dragging it into your browser window.

### Step 4. Configure Sheetmapper

To use Sheetmapper, you must add both your Google Sheet download URL and your Mapbox Access Token to the javascript code.

In Visual Studio Code, scroll to the area where `sheetMapperOptions` is defined:

```
        const sheetmapperOptions = {
            googleSheetDownloadUrl: 'YOUR_GOOGLE_SHEET_DOWNLOAD_URL',
            mapboxAccessToken: 'YOUR_MAPBOX_ACCESS_TOKEN',
            markerOptions: { // You can add any Marker options https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker-parameters
                color: '#4682b4',
                scale: 0.8
            },
            title: 'Mapbox Sheetmapper',
            description: 'Sheetmapper is an html and javascript template to help you quickly create an interactive map with point data sourced from a google sheet.'
        }
```

Replace `'YOUR_GOOGLE_SHEET_DOWNLOAD_URL'` with the download URL you copied in Step 2.

Replace `'YOUR_MAPBOX_ACCESS_TOKEN'` with your public access token, which can be found at [https://account.mapbox.com](https://account.mapbox.com)

Save the Sheetmapper HTML file and check the preview in your web browser. If everything is configured properly, you should see a map with a marker for each row in your sheet.

You can also configure the following values in the `sheetmapperOptions` object:

| Property              | Type     | Description                                                                                                |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `markerOptions.color` | `String` | A hex code or html color name, used to color the markers.                                                  |
| `markerOptions.scale` | `Number` | The scale to use to resize the marker. A scale of `1` corresponds to a height of 41px and a width of 27px. |
| `title`               | `String` | A title for your map, displayed in large bold text overlaying the map.                                     |
| `description`         | `String` | A description for your map, displayed in smaller text below the title.                                     |

You can define additional `markerOptions` as defined in the [Mapbox GL JS API Reference Documentation](https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker)

### Troubleshooting

If you encounter issues while setting up or previewing Sheetmapper, here are some common things to check:

- **Google Sheet Not Loading**: Make sure your Google Sheet is published to the web and that you've copied the CSV download URL correctly. Test the URL by pasting it into your browser to ensure it downloads as expected.
- **Map Not Displaying**: Check that you've correctly replaced `'YOUR_MAPBOX_ACCESS_TOKEN'` with your Mapbox access token. If you're seeing a blank map or an error message, the token might be missing or incorrect.
- **Markers Not Showing Up**: Verify that your Google Sheet includes the `Latitude` and `Longitude` columns, and that these values are correctly formatted as decimal coordinates (e.g., `37.7749` and `-122.4194`).
- **JavaScript Errors**: If you see any JavaScript errors, open your browser’s **Developer Console** (usually accessible by pressing `F12` or `Ctrl+Shift+I`) to view error messages, which can help you identify missing data or syntax issues.

### Data Updates

Because the web browser is pulling data directly from your google sheet via its CSV download URL, any changes made to the data in the sheet will be available immediately in your Sheetmapper map as soon as you refresh the browser.

### Customization

Sheetmapper is designed to be a flexible starting point. Here are a few ways you can customize it further:

- **Custom Columns**: You can add any column names you like to your Google Sheet. To use additional columns in your popups or markers, edit the JavaScript in the HTML file where the markers are created. For example, if you add a column called `Website`, you can modify the popup code to display it.

- **Additional Styling**: You can add custom CSS within the HTML file to change the look of the map title, description, or popups. Modify the existing CSS or add new styles as needed.

- **JavaScript Modifications**: For more advanced customizations, you can modify the JavaScript to change how markers behave, add animations, or handle user interactions differently. This may require familiarity with HTML, CSS, and JavaScript.

Sheetmapper is a template, and you are free to enhance it by adding your own HTML, CSS, and JavaScript to suit your needs.

### Deployment

After configuring and testing Sheetmapper locally, you can deploy it to make your map accessible to others. Here are a few easy options for hosting a single HTML file:

- **GitHub Pages**: You can host the HTML file directly on GitHub Pages for free. Follow [this guide](https://docs.github.com/en/pages/quickstart) to create a GitHub repository and enable GitHub Pages for static site hosting.

- **Glitch**: Glitch allows you to create, edit, and host a project entirely online. Go to [Glitch](https://glitch.com/), create a new project, upload your HTML file, and Glitch will provide a URL where your map will be accessible.

With deployment, your Sheetmapper will be publicly accessible, allowing anyone to view and interact with your map.

### Additional Resources
- **Mapbox GL JS Documentation**: [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/)
- **Mapbox Marker Options**: Customize markers using options available [here](https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker).
- **Google Sheets Publishing**: Refer to [Google’s guide](https://support.google.com/docs/answer/183965) for more details on publishing sheets to the web.

With these resources and customizations, you can build an engaging, interactive map tailored to your data and styling preferences.

