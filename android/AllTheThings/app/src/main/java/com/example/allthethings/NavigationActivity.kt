package com.example.allthethings

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.mapbox.dash.sdk.DashNavigationFragment
import com.mapbox.dash.sdk.coordination.PointDestination
import com.mapbox.geojson.Point
import kotlinx.coroutines.launch

class NavigationActivity : AppCompatActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_navigation)

    if (savedInstanceState == null) {
      val destination = Point.fromLngLat(intent.getDoubleExtra(EXTRA_LONGITUDE, 0.0), intent.getDoubleExtra(EXTRA_LATITUDE, 0.0))
      val fragment = supportFragmentManager.findFragmentById(R.id.navigation_fragment) as DashNavigationFragment
      lifecycleScope.launch { fragment.setDestination(PointDestination(destination)) }
    }
  }

  companion object {
    private const val EXTRA_LONGITUDE = "extra_longitude"
    private const val EXTRA_LATITUDE = "extra_latitude"

    fun start(context: Context, destination: Point) {
      context.startActivity(
        Intent(context, NavigationActivity::class.java)
          .putExtra(EXTRA_LONGITUDE, destination.longitude())
          .putExtra(EXTRA_LATITUDE, destination.latitude())
      )
    }
  }
}
