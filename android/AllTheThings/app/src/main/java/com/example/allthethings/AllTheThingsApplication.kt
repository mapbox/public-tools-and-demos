package com.example.allthethings

import android.app.Application
import com.mapbox.dash.sdk.Dash

class AllTheThingsApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Dash.init(
            context = this,
            accessToken = getString(R.string.mapbox_access_token),
        )
    }
}
