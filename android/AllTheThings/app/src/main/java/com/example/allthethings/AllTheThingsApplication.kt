package com.example.allthethings

import android.app.Application
import com.mapbox.common.location.Location
import com.mapbox.dash.sdk.Dash
import com.mapbox.dash.sdk.config.api.UiModeSettings
import com.mapbox.dash.sdk.config.api.debugSettings
import com.mapbox.dash.sdk.config.api.locationSimulation
import com.mapbox.dash.sdk.config.api.ui

class AllTheThingsApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Dash.init(
            context = this,
            accessToken = getString(R.string.mapbox_access_token),
        ) {
            locationSimulation {
                locationSimulationEnabled = true
                defaultLocation = Location.Builder().latitude(28.54).longitude(-81.38).build()
            }
            ui {
                // Force day mode instead of the default sun-position-based auto mode
                uiModeSettings = UiModeSettings.DAY
            }
            debugSettings {
                // Show the "Simulate location" developer option in the settings screen
                showSimulateLocationOption = true
            }
        }
    }
}
