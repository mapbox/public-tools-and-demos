package com.example.allthethings.ui.main

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation3.runtime.NavKey
import com.example.allthethings.data.DefaultDataRepository
import com.mapbox.geojson.Point
import com.mapbox.maps.dsl.cameraOptions
import com.mapbox.maps.extension.compose.MapboxMap
import com.mapbox.maps.extension.compose.animation.viewport.rememberMapViewportState
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

  MapboxMap(
    modifier = modifier.fillMaxSize(),
    mapViewportState = mapViewportState,
    scaleBar = { ScaleBar(Modifier.statusBarsPadding()) },
    logo = { Logo(Modifier.navigationBarsPadding()) },
    attribution = { Attribution(Modifier.navigationBarsPadding()) },
  )
}
