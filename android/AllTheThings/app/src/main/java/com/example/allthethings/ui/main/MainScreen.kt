package com.example.allthethings.ui.main

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation3.runtime.NavKey
import com.example.allthethings.data.DefaultDataRepository
import com.mapbox.geojson.Point
import com.mapbox.maps.Style
import com.mapbox.maps.dsl.cameraOptions
import com.mapbox.maps.extension.compose.MapboxMap
import com.mapbox.maps.extension.compose.animation.viewport.rememberMapViewportState
import com.mapbox.maps.extension.compose.style.MapStyle
import com.mapbox.maps.plugin.animation.MapAnimationOptions

@Composable
fun MainScreen(
  onItemClick: (NavKey) -> Unit,
  modifier: Modifier = Modifier,
  viewModel: MainScreenViewModel = viewModel { MainScreenViewModel(DefaultDataRepository()) },
) {
  val state by viewModel.uiState.collectAsStateWithLifecycle()
  when (state) {
    MainScreenUiState.Loading -> {
      // Blank
    }
    is MainScreenUiState.Success -> {
      MainScreen(modifier = modifier)
    }
    is MainScreenUiState.Error -> {
      Text("Error loading data: ${(state as MainScreenUiState.Error).throwable.message}")
    }
  }
}

@Composable
internal fun MainScreen(modifier: Modifier = Modifier) {
  var isSatellite by rememberSaveable { mutableStateOf(false) }
  val mapViewportState = rememberMapViewportState {
    setCameraOptions {
      center(Point.fromLngLat(-81.38, 28.54))
      zoom(0.0)
    }
  }

  LaunchedEffect(Unit) {
    mapViewportState.flyTo(
      cameraOptions {
        center(Point.fromLngLat(-81.38, 28.54))
        zoom(11.0)
      },
      MapAnimationOptions.mapAnimationOptions { duration(2000) },
    )
  }

  Column(modifier = modifier.fillMaxSize()) {
    MapboxMap(
      modifier = Modifier.weight(1f),
      mapViewportState = mapViewportState,
      style = { MapStyle(style = if (isSatellite) Style.STANDARD_SATELLITE else Style.STANDARD) },
      scaleBar = { ScaleBar(Modifier.statusBarsPadding()) },
    )
    StyleToggleBottomBar(isSatellite = isSatellite, onToggle = { isSatellite = !isSatellite })
  }
}
