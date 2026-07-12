package com.example.allthethings.ui.main

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.mapbox.geojson.Feature
import com.mapbox.geojson.Point

private val MapboxBlue = Color(0xFF4264FB)

/** Modal bottom sheet summarizing a tapped attraction [Feature]. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AttractionBottomSheet(attraction: Feature, onDismiss: () -> Unit, onNavigate: (Point) -> Unit) {
  ModalBottomSheet(onDismissRequest = onDismiss) {
    Column(
      modifier = Modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(horizontal = 16.dp),
      verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
      AsyncImage(
        model = attraction.getStringProperty("imageUrl"),
        contentDescription = attraction.getStringProperty("name"),
        modifier = Modifier.fillMaxWidth().height(180.dp).clip(RoundedCornerShape(12.dp)),
        contentScale = ContentScale.Crop,
      )
      Text(text = attraction.getStringProperty("name").orEmpty(), style = MaterialTheme.typography.headlineSmall)
      Text(
        text =
          listOfNotNull(
              attraction.getStringProperty("category"),
              attraction.getNumberProperty("rating")?.let { "★ $it (${attraction.getNumberProperty("reviewCount")} reviews)" },
              attraction.getStringProperty("priceRange"),
            )
            .joinToString("  ·  "),
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
      )
      Text(text = attraction.getStringProperty("description").orEmpty(), style = MaterialTheme.typography.bodyMedium)
      Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        attraction.getProperty("tags")?.asJsonArray?.take(3)?.forEach { tag ->
          AssistChip(onClick = {}, label = { Text(tag.asString) })
        }
      }
      attraction.getStringProperty("address")?.let { Text(text = it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
      attraction.getStringProperty("openHours")?.let {
        Text(text = "Open $it", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
      }
      Button(
        onClick = { (attraction.geometry() as? Point)?.let(onNavigate) },
        modifier = Modifier.fillMaxWidth().padding(top = 8.dp, bottom = 16.dp),
        colors = ButtonDefaults.buttonColors(containerColor = MapboxBlue, contentColor = Color.White),
      ) {
        Text("Navigate")
      }
      Spacer(modifier = Modifier.height(8.dp))
    }
  }
}
