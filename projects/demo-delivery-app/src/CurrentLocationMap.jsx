import React from "react";
import { accessToken } from 'mapbox-demo-components'


const CurrentLocationMap = ({ point }) => {
    const [longitude, latitude] = point.coordinates
    return (
        <div className="relative w-[210px] h-[120px]">
            <img
                src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${longitude},${latitude},9,0/210x120@2x?access_token=${accessToken}`}
                alt="Current Location Map"
                className="w-full h-full object-cover rounded-sm"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                <div className="w-2.5 h-2.5 bg-blue-700 rounded-full absolute"></div>
            </div>
        </div>
    );
};

export default CurrentLocationMap;
