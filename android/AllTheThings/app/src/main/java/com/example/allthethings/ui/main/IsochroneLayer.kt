package com.example.allthethings.ui.main

import android.util.Log
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.mapbox.api.isochrone.IsochroneCriteria
import com.mapbox.api.isochrone.MapboxIsochrone
import com.mapbox.common.MapboxOptions
import com.mapbox.geojson.FeatureCollection
import com.mapbox.geojson.Point
import com.mapbox.maps.extension.compose.MapboxMapComposable
import com.mapbox.maps.extension.compose.style.ColorValue
import com.mapbox.maps.extension.compose.style.DoubleValue
import com.mapbox.maps.extension.compose.style.layers.generated.FillLayer
import com.mapbox.maps.extension.compose.style.sources.GeoJSONData
import com.mapbox.maps.extension.compose.style.sources.generated.rememberGeoJsonSourceState
import com.mapbox.maps.extension.style.expressions.generated.Expression
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Fetches driving-traffic isochrone contours around [center] from the Mapbox Isochrone API and
 * renders them as fill polygons. Colors come from the `fill` property of the API response.
 */
@Composable
@MapboxMapComposable
fun IsochroneLayer(center: Point) {
  var isochrone by remember { mutableStateOf<FeatureCollection?>(null) }

  LaunchedEffect(center) {
    try {
      val response =
        withContext(Dispatchers.IO) {
          MapboxIsochrone.builder()
            .accessToken(MapboxOptions.accessToken)
            .profile(IsochroneCriteria.PROFILE_DRIVING_TRAFFIC)
            .coordinates(center)
            .addContoursMinutes(5, 10, 15)
            .polygons(true)
            .build()
            .executeCall()
        }
      if (response.isSuccessful) {
        isochrone = response.body()
      } else {
        Log.w("IsochroneLayer", "Isochrone request failed: ${response.code()} ${response.message()}")
      }
    } catch (e: Exception) {
      Log.w("IsochroneLayer", "Isochrone request failed", e)
    }
  }

  isochrone?.let { featureCollection ->
    val sourceState = rememberGeoJsonSourceState()
    sourceState.data = GeoJSONData(featureCollection.features().orEmpty())
    FillLayer(sourceState = sourceState) {
      fillColor = ColorValue(Expression.get("fill"))
      fillOpacity = DoubleValue(0.33)
    }
  }
}
