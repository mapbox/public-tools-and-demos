package com.example.allthethings.data

import android.content.Context
import com.mapbox.geojson.Feature
import com.mapbox.geojson.FeatureCollection
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn

interface DataRepository {
  val data: Flow<List<Feature>>
}

class DefaultDataRepository(private val context: Context) : DataRepository {
  override val data: Flow<List<Feature>> =
    flow {
        val json = context.assets.open("attractions.json").bufferedReader().use { it.readText() }
        emit(FeatureCollection.fromJson(json).features().orEmpty())
      }
      .flowOn(Dispatchers.IO)
}
