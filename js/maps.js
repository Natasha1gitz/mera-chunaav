// ============================================
// Mera Chunaav — Google Maps Module
// Dynamically loads the Maps SDK using the API key from config.js.
// Uses a global callback (__initMap) so the Promise resolves only
// after the API is fully ready.
// ============================================

const MapsModule = {
  map: null,
  marker: null,

  DARK_STYLE: [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
    { featureType: 'land', elementType: 'geometry', stylers: [{ color: '#0A1628' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] }
  ],

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
