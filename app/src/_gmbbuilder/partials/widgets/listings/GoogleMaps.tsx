import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '266px'
};

interface Props{
    longitude:string;
    latitude:string;
}
const apiKey = import.meta.env.VITE_APP_GOOGLE_MAP_API_KEY;

const GoogleMapsComponent: React.FC<Props> = ({
    latitude,
    longitude
}) => {

    const [pointCenter,setPointCenter] = useState<any>({
        lat: "",
        lng: ""
    });

    useEffect(() => {
        if(!!latitude && !!longitude){
            setPointCenter({
                lat: latitude,
                lng: longitude
            });
        }
    },[latitude,longitude]);
    return (
        <LoadScript
        googleMapsApiKey="AIzaSyBYUHalEKjZs0r_x_7gUCpdQZ4ex3X-Kic" // Replace with your API key
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={pointCenter}
                zoom={15}
            >
                <Marker position={pointCenter} />
            </GoogleMap>
        </LoadScript>
    );
};

export default GoogleMapsComponent;
