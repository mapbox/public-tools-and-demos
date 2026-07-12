package com.example.allthethings.ui.main

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.BottomAppBar
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

private val MapboxBlue = Color(0xFF4264FB)

@Composable
fun MapControlsBottomBar(
  isSatellite: Boolean,
  onStyleToggle: () -> Unit,
  isPlaying: Boolean,
  onPlayPauseToggle: () -> Unit,
  onSearchClick: () -> Unit,
  modifier: Modifier = Modifier,
) {
  BottomAppBar(modifier = modifier) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterHorizontally),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      Button(
        onClick = onPlayPauseToggle,
        colors = ButtonDefaults.buttonColors(containerColor = MapboxBlue, contentColor = Color.White),
      ) {
        Text(if (isPlaying) "Pause" else "Play")
      }
      Button(
        onClick = onSearchClick,
        colors = ButtonDefaults.buttonColors(containerColor = MapboxBlue, contentColor = Color.White),
      ) {
        Text("Search")
      }
      Button(
        onClick = onStyleToggle,
        colors = ButtonDefaults.buttonColors(containerColor = MapboxBlue, contentColor = Color.White),
      ) {
        Text(if (isSatellite) "Standard" else "Satellite")
      }
    }
  }
}
