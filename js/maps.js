/**
 * @fileoverview Google Maps JavaScript SDK integration for rendering
 * interactive polling booth maps with custom dark styling.
 * Dynamically loads the SDK via script injection with a global callback.
 * @module maps
 */

// ============================================
// Mera Chunaav — Maps Module
// Uses dynamic SDK loading with a global __initMap callback
// after the API is fully ready.
// ============================================

/**
 * Google Maps integration module.
 * Dynamically loads the Maps JavaScript SDK and renders an interactive map
 * with custom dark styling for polling booth locations.
 * @namespace MapsModule
 */
const MapsModule = {
  map: null,
  marker: null,

  DARK_STYLE: [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0A1628' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] }
  ],

  /**
   * Dynamically loads the Google Maps JavaScript SDK via script injection.
   * Uses a global callback (__initMap) to resolve only when the API is ready.
   * @returns {Promise<void>} Resolves when google.maps is available.
   */
  load() {
    if (typeof google !== 'undefined' && google.maps) return Promise.resolve();

    // If the script tag already exists, wait for it to finish loading
    if (document.getElementById('google-maps-script')) {
      return new Promise(resolve => {
        const check = setInterval(() => {
          if (typeof google !== 'undefined' && google.maps) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });
    }

    const apiKey = window.CONFIG?.MAPS_API_KEY;
    if (!apiKey) return Promise.reject(new Error('Maps API key not configured'));

    return new Promise((resolve, reject) => {
      window.__initMap = resolve;
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__initMap`;
      script.async = true;
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      document.head.appendChild(script);
    });
  },

  /**
   * Initializes a Google Map inside the given container with a marker.
   * @param {HTMLElement} container - The DOM element to render the map into.
   * @param {number} lat - Latitude of the polling booth.
   * @param {number} lng - Longitude of the polling booth.
   * @param {string} title - The marker tooltip title.
   * @returns {Promise<void>}
   */
  async init(container, lat, lng, title) {
    await this.load();

    this.map = new google.maps.Map(container, {
      center: { lat, lng },
      zoom: 15,
      styles: this.DARK_STYLE,
      disableDefaultUI: true,
      zoomControl: true
    });

    this.marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      title
    });
  }
};
