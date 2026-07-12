package com.example.allthethings.ui.main

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.painterResource
import com.example.allthethings.R
import com.mapbox.geojson.Feature
import com.mapbox.geojson.Point
import com.mapbox.maps.extension.compose.MapboxMapComposable
import com.mapbox.maps.extension.compose.annotation.generated.PointAnnotation
import com.mapbox.maps.extension.compose.annotation.rememberIconImage
import com.mapbox.maps.extension.style.layers.properties.generated.IconAnchor

/** Renders a tappable marker for each attraction [Feature] with a Point geometry. */
@Composable
@MapboxMapComposable
fun AttractionMarkers(attractions: List<Feature>, onAttractionClick: (Feature) -> Unit) {
  val markerImage = rememberIconImage(key = R.drawable.ic_marker, painter = painterResource(R.drawable.ic_marker))
  attractions.forEach { feature ->
    val point = feature.geometry() as? Point ?: return@forEach
    PointAnnotation(point = point) {
      iconImage = markerImage
      iconAnchor = IconAnchor.BOTTOM
      interactionsState.onClicked {
        onAttractionClick(feature)
        true
      }
    }
  }
}
