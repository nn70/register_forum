'use client';

import { useState, useEffect, useRef } from 'react';

interface LocationInputProps {
    defaultValue?: string;
    onLocationSelect?: (location: { address: string; lat: number; lng: number }) => void;
}

export default function LocationInput({ defaultValue, onLocationSelect }: LocationInputProps) {
    const [address, setAddress] = useState(defaultValue || '');
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [showMap, setShowMap] = useState(false);

    // Generate Google Maps link
    const getMapLink = () => {
        if (lat && lng) {
            return `https://www.google.com/maps?q=${lat},${lng}`;
        }
        if (address) {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        }
        return null;
    };

    // Simple geocoding using browser's built-in API (limited but free)
    const geocodeAddress = async () => {
        if (!address) return;

        // Use a free geocoding API (Nominatim - OpenStreetMap)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
                { headers: { 'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8' } }
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const result = data[0];
                setLat(parseFloat(result.lat));
                setLng(parseFloat(result.lon));
                setShowMap(true);
                onLocationSelect?.({
                    address: result.display_name || address,
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon)
                });
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                活動地點
            </label>

            <div className="flex gap-2">
                <input
                    name="location"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={geocodeAddress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="台北市信義區信義路五段7號"
                />
                {getMapLink() && (
                    <a
                        href={getMapLink()!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        地圖
                    </a>
                )}
            </div>

            {/* Hidden inputs for lat/lng */}
            <input type="hidden" name="locationLat" value={lat || ''} />
            <input type="hidden" name="locationLng" value={lng || ''} />

            {/* Map preview */}
            {showMap && lat && lng && (
                <div className="mt-2 rounded overflow-hidden border border-gray-200">
                    <iframe
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        loading="lazy"
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${lat},${lng}&zoom=15`}
                    />
                </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
                輸入地址後點擊空白處以自動定位
            </p>
        </div>
    );
}
