package com.example.allthethings.ui.main

import android.util.Log
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Attractions
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.Fastfood
import androidx.compose.material.icons.filled.Flight
import androidx.compose.material.icons.filled.Hotel
import androidx.compose.material.icons.filled.LocalBar
import androidx.compose.material.icons.filled.LocalCafe
import androidx.compose.material.icons.filled.LocalGasStation
import androidx.compose.material.icons.filled.LocalGroceryStore
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.LocalPharmacy
import androidx.compose.material.icons.filled.Museum
import androidx.compose.material.icons.filled.Park
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Store
import androidx.compose.material.icons.filled.Train
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.mapbox.geojson.Point
import com.mapbox.search.autocomplete.PlaceAutocomplete
import com.mapbox.search.autocomplete.PlaceAutocompleteSuggestion
import kotlinx.coroutines.delay

/** Modal bottom sheet with a live Place Autocomplete search experience biased around [proximity]. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchBottomSheet(proximity: Point, onDismiss: () -> Unit, onNavigate: (Point) -> Unit) {
  val placeAutocomplete = remember { PlaceAutocomplete.create() }
  var query by remember { mutableStateOf("") }
  var suggestions by remember { mutableStateOf<List<PlaceAutocompleteSuggestion>>(emptyList()) }

  LaunchedEffect(query) {
    if (query.isBlank()) {
      suggestions = emptyList()
      return@LaunchedEffect
    }
    delay(300) // Debounce keystrokes
    placeAutocomplete
      .suggestions(query = query, proximity = proximity)
      .onValue { suggestions = it }
      .onError { Log.w("SearchBottomSheet", "Autocomplete request failed", it) }
  }

  ModalBottomSheet(onDismissRequest = onDismiss, sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)) {
    Column(modifier = Modifier.fillMaxHeight(0.9f).padding(horizontal = 16.dp)) {
      Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
        OutlinedTextField(
          value = query,
          onValueChange = { query = it },
          modifier = Modifier.fillMaxWidth(),
          placeholder = { Text("Search places") },
          leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
          singleLine = true,
        )
      }
      LazyColumn(modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
        items(suggestions) { suggestion -> SuggestionRow(suggestion = suggestion, onClick = { suggestion.coordinate?.let(onNavigate) }) }
      }
    }
  }
}

@Composable
private fun SuggestionRow(suggestion: PlaceAutocompleteSuggestion, onClick: () -> Unit) {
  ListItem(
    modifier = Modifier.clickable(onClick = onClick),
    leadingContent = { Icon(imageVector = suggestion.makiIcon.toIcon(), contentDescription = null) },
    headlineContent = { Text(suggestion.name) },
    supportingContent = {
      suggestion.categories?.firstOrNull()?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
    },
    trailingContent = {
      suggestion.distanceMeters?.let {
        Text(formatDistance(it), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
      }
    },
  )
}

private fun formatDistance(meters: Double): String =
  if (meters >= 1000) "%.1f km".format(meters / 1000) else "${meters.toInt()} m"

private fun String?.toIcon(): ImageVector =
  when (this) {
    "restaurant" -> Icons.Default.Restaurant
    "fast-food" -> Icons.Default.Fastfood
    "cafe" -> Icons.Default.LocalCafe
    "bar" -> Icons.Default.LocalBar
    "lodging" -> Icons.Default.Hotel
    "shop", "clothing-store" -> Icons.Default.Store
    "grocery" -> Icons.Default.LocalGroceryStore
    "park", "garden" -> Icons.Default.Park
    "museum" -> Icons.Default.Museum
    "attraction", "amusement-park" -> Icons.Default.Attractions
    "hospital" -> Icons.Default.LocalHospital
    "pharmacy" -> Icons.Default.LocalPharmacy
    "school", "college" -> Icons.Default.School
    "fuel" -> Icons.Default.LocalGasStation
    "bank" -> Icons.Default.AccountBalance
    "airport" -> Icons.Default.Flight
    "bus" -> Icons.Default.DirectionsBus
    "rail", "rail-metro" -> Icons.Default.Train
    else -> Icons.Default.Place
  }
