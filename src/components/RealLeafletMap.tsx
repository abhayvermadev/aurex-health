import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { StateData, District, Facility } from '../types';
import { STATE_GEO_CENTERS } from '../data/healthData';
import {
  MapPin,
  Hospital,
  Warehouse,
  FileText,
  Activity,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface RealLeafletMapProps {
  level: 'national' | 'state' | 'district';
  states: StateData[];
  selectedStateId?: string | null;
  selectedDistrictId?: string | null;
  selectedFacilityId?: string | null;
  onSelectState?: (stateId: string) => void;
  onSelectDistrict?: (districtId: string) => void;
  onSelectFacility?: (facilityId: string) => void;
  onOpenFacilityReport?: (facility: Facility) => void;
  mode?: 'medicines' | 'beds';
  title?: string;
  subtitle?: string;
}

export const RealLeafletMap: React.FC<RealLeafletMapProps> = ({
  level,
  states,
  selectedStateId,
  selectedDistrictId,
  selectedFacilityId,
  onSelectState,
  onSelectDistrict,
  onSelectFacility,
  onOpenFacilityReport,
  mode = 'medicines',
  title,
  subtitle,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Active hover info displayed in a dedicated bottom bar to completely eliminate hover flickering
  const [activeTelemetry, setActiveTelemetry] = useState<{
    title: string;
    subtitle: string;
    status: string;
    isCritical: boolean;
    tag: string;
  } | null>(null);

  const currentState = useMemo(() => {
    return states.find((s) => s.id === selectedStateId) || states[0];
  }, [states, selectedStateId]);

  const currentDistrict = useMemo(() => {
    if (!currentState) return null;
    return (
      currentState.districts.find((d) => d.id === selectedDistrictId) ||
      currentState.districts[0]
    );
  }, [currentState, selectedDistrictId]);

  // 1. Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.5937, 78.9629],
        zoom: 4.8,
        zoomControl: false,
        attributionControl: false,
        maxBounds: [
          [5.0, 65.0],
          [38.5, 99.5],
        ],
        minZoom: 4,
        maxZoom: 18,
      });

      // CartoDB Positron: Pristine, minimal white map with subtle administrative lines and roads
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);

      // Attribution
      L.control
        .attribution({
          position: 'bottomright',
          prefix: '© OpenStreetMap, © CARTO',
        })
        .addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up map instance if component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Synchronize Pins & Geographic Zoom when level/state/district changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear previous markers
    markersLayer.clearLayers();

    // Leaflet container resize check
    map.invalidateSize();

    // -------------------------------------------------------------
    // NATIONAL LEVEL: Show all 36 States & UTs across India
    // -------------------------------------------------------------
    if (level === 'national' || !selectedStateId) {
      map.flyTo([22.5937, 78.9629], 4.8, { duration: 0.8 });

      states.forEach((st) => {
        const center = STATE_GEO_CENTERS[st.id] || { lat: 22.0, lng: 78.0 };
        const isCritical = st.activeStockoutAlerts > 0;
        const isSelected = selectedStateId === st.id;

        const pinColorClass = isSelected
          ? 'bg-indigo-600 ring-2 ring-indigo-400 text-white'
          : isCritical
          ? 'bg-rose-500 text-white'
          : 'bg-emerald-500 text-white';

        const customHtml = `
          <div class="custom-map-node flex items-center justify-center cursor-pointer select-none" style="width: 28px; height: 28px;">
            ${
              isCritical
                ? `<span class="absolute w-7 h-7 rounded-full bg-rose-400 opacity-60 pointer-events-none animate-ping"></span>`
                : ''
            }
            <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shadow-md border-2 border-white ${pinColorClass} transition-transform">
              ${st.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'leaflet-pin-clean',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([center.lat, center.lng], { icon });

        // Native Leaflet Tooltip (Zero flicker)
        marker.bindTooltip(
          `<strong>${st.name}</strong><br/><span style="font-size:11px;color:${isCritical ? '#e11d48' : '#059669'}">${
            isCritical ? `⚠️ ${st.activeStockoutAlerts} Stockouts` : '✓ Optimal Buffer'
          }</span>`,
          { direction: 'top', offset: [0, -14], opacity: 0.95 }
        );

        marker.on('click', () => {
          if (onSelectState) onSelectState(st.id);
        });

        marker.on('mouseover', () => {
          setActiveTelemetry({
            title: `${st.name} State Grid`,
            subtitle: `Capital: ${st.capital} • ${st.districts.length} Monitored Districts`,
            status: isCritical
              ? `Action Required: ${st.activeStockoutAlerts} Critical Stockout Alerts`
              : 'All District Health Hubs Operating at Safety Buffer',
            isCritical,
            tag: `${st.districts.length} Districts`,
          });
        });

        markersLayer.addLayer(marker);
      });
    }

    // -------------------------------------------------------------
    // STATE LEVEL: Show only the Selected State's Districts & Warehouses
    // -------------------------------------------------------------
    else if (level === 'state' || (selectedStateId && !selectedDistrictId)) {
      if (currentState) {
        const stateCenter = STATE_GEO_CENTERS[currentState.id] || {
          lat: 20.0,
          lng: 78.0,
          zoom: 7,
        };

        // Extract district coordinates
        const allCoords: [number, number][] = [];
        currentState.districts.forEach((d) => {
          d.facilities.forEach((f) => {
            if (f.coordinates?.lat && f.coordinates?.lng) {
              allCoords.push([f.coordinates.lat, f.coordinates.lng]);
            }
          });
        });

        if (allCoords.length > 0) {
          const bounds = L.latLngBounds(allCoords);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 9, animate: true });
        } else {
          map.flyTo([stateCenter.lat, stateCenter.lng], stateCenter.zoom, { duration: 0.8 });
        }

        currentState.districts.forEach((d) => {
          const firstFac = d.facilities[0];
          const distLat = firstFac?.coordinates?.lat || stateCenter.lat;
          const distLng = firstFac?.coordinates?.lng || stateCenter.lng;
          const hasAlert = mode === 'medicines' ? d.stockoutAlertCount > 0 : d.bedStressCount > 0;
          const isSelected = selectedDistrictId === d.id;

          const badgeBg = isSelected
            ? 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-200'
            : hasAlert
            ? 'bg-rose-50 text-rose-800 border-rose-300'
            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300';

          const customHtml = `
            <div class="custom-district-node flex flex-col items-center cursor-pointer select-none" style="transform: translate(-50%, -50%);">
              ${
                hasAlert
                  ? `<span class="absolute w-8 h-8 rounded-full bg-rose-400 opacity-50 pointer-events-none animate-ping"></span>`
                  : ''
              }
              <div class="px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border text-xs font-semibold ${badgeBg} whitespace-nowrap">
                <span class="w-2 h-2 rounded-full ${hasAlert ? 'bg-rose-500' : 'bg-emerald-500'}"></span>
                <span>${d.name}</span>
                ${d.isSurplus ? `<span class="text-[9px] bg-blue-100 text-blue-700 font-bold px-1 rounded">Depot</span>` : ''}
              </div>
            </div>
          `;

          const icon = L.divIcon({
            html: customHtml,
            className: 'leaflet-pin-clean',
            iconSize: [110, 30],
            iconAnchor: [55, 15],
          });

          const marker = L.marker([distLat, distLng], { icon });

          marker.bindTooltip(
            `<strong>${d.name} District</strong><br/><span style="font-size:11px;color:${hasAlert ? '#e11d48' : '#059669'}">${
              hasAlert ? `⚠️ ${d.stockoutAlertCount} Critical Facilities` : '✓ Safety Buffer Intact'
            }</span>`,
            { direction: 'top', offset: [0, -15], opacity: 0.95 }
          );

          marker.on('click', () => {
            if (onSelectDistrict) onSelectDistrict(d.id);
          });

          marker.on('mouseover', () => {
            setActiveTelemetry({
              title: `${d.name} District (${currentState.name})`,
              subtitle: `${d.facilities.length} PHCs/CHCs Monitored • ${d.isSurplus ? 'Regional Supply Depot' : 'Sub-District Cluster'}`,
              status: hasAlert
                ? `Critical: ${d.stockoutAlertCount} Health Facilities Below Minimum Supply Buffer`
                : 'All Facilities Operating with 10+ Days of Supply',
              isCritical: hasAlert,
              tag: `${d.facilities.length} Facilities`,
            });
          });

          markersLayer.addLayer(marker);
        });
      }
    }

    // -------------------------------------------------------------
    // DISTRICT LEVEL: Show only the Selected District's PHCs & CHCs
    // -------------------------------------------------------------
    else if (level === 'district' || (selectedStateId && selectedDistrictId)) {
      if (currentDistrict && currentDistrict.facilities.length > 0) {
        const facCoords = currentDistrict.facilities
          .filter((f) => f.coordinates?.lat && f.coordinates?.lng)
          .map((f) => [f.coordinates.lat, f.coordinates.lng] as [number, number]);

        if (facCoords.length > 0) {
          const bounds = L.latLngBounds(facCoords);
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13, animate: true });
        }

        currentDistrict.facilities.forEach((fac) => {
          const isSelected = selectedFacilityId === fac.id;
          const severity = mode === 'medicines' ? fac.medicineSeverity : fac.bedSeverity;
          const isCritical = severity === 'CRITICAL';
          const isWarning = severity === 'WARNING';
          const dotColor = isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';

          const cardBg = isSelected
            ? 'bg-indigo-700 text-white border-indigo-800 shadow-lg ring-2 ring-indigo-400'
            : isCritical
            ? 'bg-white text-rose-800 border-rose-300 shadow-sm'
            : 'bg-white text-slate-800 border-slate-200 shadow-sm hover:border-slate-300';

          const customHtml = `
            <div class="custom-fac-node flex flex-col items-center cursor-pointer select-none" style="transform: translate(-50%, -100%);">
              ${
                isCritical
                  ? `<span class="absolute top-0 w-8 h-8 rounded-full bg-rose-400 opacity-60 pointer-events-none animate-ping"></span>`
                  : ''
              }
              <div class="px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${cardBg} whitespace-nowrap text-xs font-semibold">
                <span class="w-2.5 h-2.5 rounded-full ${dotColor}"></span>
                <span>${fac.name.replace(' Primary Health Centre', '').replace(' Community Health Centre', '')} (${fac.type})</span>
              </div>
              <div class="w-2 h-2 rotate-45 -mt-1 ${isSelected ? 'bg-indigo-700' : 'bg-white border-r border-b border-slate-200'}"></div>
            </div>
          `;

          const icon = L.divIcon({
            html: customHtml,
            className: 'leaflet-pin-clean',
            iconSize: [120, 36],
            iconAnchor: [60, 36],
          });

          const marker = L.marker([fac.coordinates.lat, fac.coordinates.lng], { icon });

          marker.bindTooltip(
            `<strong>${fac.name}</strong><br/><span style="font-size:11px;">Incharge: ${fac.inchargeDoctor}</span><br/><span style="font-size:11px;font-weight:bold;color:${
              isCritical ? '#e11d48' : '#059669'
            }">${isCritical ? '⚠️ CRITICAL STOCKOUT' : '✓ DOS Normal'}</span>`,
            { direction: 'top', offset: [0, -36], opacity: 0.95 }
          );

          marker.on('click', () => {
            if (onSelectFacility) onSelectFacility(fac.id);
            if (onOpenFacilityReport) onOpenFacilityReport(fac);
          });

          marker.on('mouseover', () => {
            setActiveTelemetry({
              title: fac.name,
              subtitle: `Incharge: ${fac.inchargeDoctor} • Population: ${fac.catchmentPopulation.toLocaleString()} • Contact: ${fac.emergencyContact}`,
              status: isCritical
                ? `CRITICAL ALERT: Essential Medicines below safety buffer (< 2 Days of Supply)`
                : `Optimal Stock: All emergency drugs and IV fluids verified compliant`,
              isCritical,
              tag: fac.type,
            });
          });

          markersLayer.addLayer(marker);
        });
      }
    }
  }, [
    level,
    states,
    selectedStateId,
    selectedDistrictId,
    selectedFacilityId,
    mode,
    currentState,
    currentDistrict,
    onSelectState,
    onSelectDistrict,
    onSelectFacility,
    onOpenFacilityReport,
  ]);

  // Controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => {
    if (!mapInstanceRef.current) return;
    if (level === 'national' || !selectedStateId) {
      mapInstanceRef.current.flyTo([22.5937, 78.9629], 4.8, { duration: 0.8 });
    } else if (level === 'state' && currentState) {
      const stateCenter = STATE_GEO_CENTERS[currentState.id] || { lat: 20.0, lng: 78.0, zoom: 7 };
      mapInstanceRef.current.flyTo([stateCenter.lat, stateCenter.lng], stateCenter.zoom, { duration: 0.8 });
    }
  };

  const headerTitle =
    title ||
    (level === 'district' && currentDistrict
      ? `${currentDistrict.name} District (${currentState?.name || 'State'}) — Real PHC & CHC Surveillance Map`
      : level === 'state' && currentState
      ? `${currentState.name} State — Real Sub-District & Supply Depot Map`
      : 'National Health Grid — India Geographic Telemetry Map');

  const headerSubtitle =
    subtitle ||
    (level === 'district'
      ? `Accurate geographic coordinates: click any PHC or CHC on the map to inspect live medicine stock, bed triage, and duty doctor reports`
      : level === 'state'
      ? `Showing ${currentState?.name || 'the selected state'}: click any district node on the map to zoom into its Primary & Community Health Centres`
      : 'Showing the map of India: click any state marker to drill down into district health hubs and warehouses');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">
              {level === 'district' ? '🏥' : level === 'state' ? '📍' : '🇮🇳'}
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">
              {headerTitle}
            </h3>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-indigo-700 border border-slate-200 font-mono font-medium">
              {level === 'district'
                ? `${currentDistrict?.facilities.length || 0} Facilities Mapped`
                : level === 'state'
                ? `${currentState?.districts.length || 0} Districts Mapped`
                : '36 States & UTs'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{headerSubtitle}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-rose-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Stockout Alert</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Optimal Buffer</span>
          </div>
        </div>
      </div>

      {/* Real Map Canvas Container */}
      <div className="relative w-full h-[440px] sm:h-[480px] rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map Floating Control Buttons (+ / - / Reset) */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-md">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset Geographic View"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Solid Non-Flickering Bottom Telemetry & Quick Action Bar */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        {activeTelemetry ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{activeTelemetry.title}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    activeTelemetry.isCritical
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {activeTelemetry.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">{activeTelemetry.subtitle}</p>
            </div>
            <div
              className={`text-xs font-semibold font-mono ${
                activeTelemetry.isCritical ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {activeTelemetry.status}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Hover or click any node on the map to inspect real-time stock and telemetry</span>
            <span className="font-mono text-[11px] text-slate-400">CartoDB Positron / OSM Light Real Coordinates</span>
          </div>
        )}

        {/* Quick Facility Report Buttons for District Level */}
        {level === 'district' && currentDistrict && (
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Click any facility in {currentDistrict.name} for full audit report:
            </span>
            <div className="flex flex-wrap gap-2">
              {currentDistrict.facilities.map((fac) => {
                const isCritical = fac.medicineSeverity === 'CRITICAL';
                return (
                  <button
                    key={fac.id}
                    onClick={() => {
                      if (onSelectFacility) onSelectFacility(fac.id);
                      if (onOpenFacilityReport) onOpenFacilityReport(fac);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isCritical
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Hospital className="w-3 h-3 text-indigo-600" />
                    <span>
                      {fac.name.replace(' Primary Health Centre', '').replace(' Community Health Centre', '')}
                    </span>
                    <FileText className="w-3 h-3 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
