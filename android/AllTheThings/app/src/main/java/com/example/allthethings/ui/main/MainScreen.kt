package com.example.allthethings.ui.main

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation3.runtime.NavKey
import com.example.allthethings.data.DefaultDataRepository
import com.mapbox.geojson.Feature
import com.mapbox.geojson.Point
import com.mapbox.maps.EdgeInsets
import com.mapbox.maps.Style
import com.mapbox.maps.coroutine.awaitCameraForCoordinates
import com.mapbox.maps.dsl.cameraOptions
import com.mapbox.maps.extension.compose.MapEffect
import com.mapbox.maps.extension.compose.MapboxMap
import com.mapbox.maps.extension.compose.animation.viewport.rememberMapViewportState
import com.mapbox.maps.extension.compose.style.MapStyle
import com.mapbox.maps.plugin.animation.MapAnimationOptions
import kotlinx.coroutines.delay

private val OrlandoCenter: Point = Point.fromLngLat(-81.38, 28.54)

@Composable
fun MainScreen(
  onItemClick: (NavKey) -> Unit,
  modifier: Modifier = Modifier,
  viewModel: MainScreenViewModel = viewModel { MainScreenViewModel(DefaultDataRepository(checkNotNull(this[APPLICATION_KEY]))) },
) {
  val state by viewModel.uiState.collectAsStateWithLifecycle()
  when (state) {
    MainScreenUiState.Loading -> {
      // Blank
    }
    is MainScreenUiState.Success -> {
      MainScreen(attractions = (state as MainScreenUiState.Success).data, modifier = modifier)
    }
    is MainScreenUiState.Error -> {
      Text("Error loading data: ${(state as MainScreenUiState.Error).throwable.message}")
    }
  }
}

@Composable
internal fun MainScreen(attractions: List<Feature>, modifier: Modifier = Modifier) {
  var isSatellite by rememberSaveable { mutableStateOf(false) }
  var isPlaying by remember { mutableStateOf(false) }
  var isSearchOpen by remember { mutableStateOf(false) }
  var selectedAttraction by remember { mutableStateOf<Feature?>(null) }
  val mapViewportState = rememberMapViewportState {
    setCameraOptions {
      center(OrlandoCenter)
      zoom(0.0)
    }
  }

  LaunchedEffect(isPlaying, attractions) {
    if (!isPlaying || attractions.isEmpty()) return@LaunchedEffect
    var index = 0
    while (true) {
      (attractions[index].geometry() as? Point)?.let { point ->
        mapViewportState.flyTo(
          cameraOptions {
            center(point)
            zoom(15.0)
            pitch(45.0)
          },
          MapAnimationOptions.mapAnimationOptions { duration(2500) },
        )
      }
      delay(5000)
      index = (index + 1) % attractions.size
    }
  }

  Column(modifier = modifier.fillMaxSize()) {
    MapboxMap(
      modifier = Modifier.weight(1f),
      mapViewportState = mapViewportState,
      style = { MapStyle(style = if (isSatellite) Style.STANDARD_SATELLITE else Style.STANDARD) },
      scaleBar = { ScaleBar(Modifier.statusBarsPadding()) },
    ) {
      IsochroneLayer(center = OrlandoCenter)
      AttractionMarkers(attractions = attractions, onAttractionClick = { selectedAttraction = it })
      MapEffect(attractions) { mapView ->
        val points = attractions.mapNotNull { it.geometry() as? Point }
        if (points.isEmpty()) return@MapEffect
        val camera =
          mapView.mapboxMap.awaitCameraForCoordinates(
            coordinates = points,
            camera = cameraOptions {},
            coordinatesPadding = EdgeInsets(100.0, 100.0, 100.0, 100.0),
          )
        camera?.let { mapViewportState.flyTo(it, MapAnimationOptions.mapAnimationOptions { duration(2000) }) }
      }
    }
    MapControlsBottomBar(
      isSatellite = isSatellite,
      onStyleToggle = { isSatellite = !isSatellite },
      isPlaying = isPlaying,
      onPlayPauseToggle = { isPlaying = !isPlaying },
      onSearchClick = { isSearchOpen = true },
    )
  }

  selectedAttraction?.let { attraction -> AttractionBottomSheet(attraction = attraction, onDismiss = { selectedAttraction = null }) }

  if (isSearchOpen) {
    SearchBottomSheet(proximity = OrlandoCenter, onDismiss = { isSearchOpen = false })
  }
}
