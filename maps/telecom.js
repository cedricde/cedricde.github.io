var BASEMAP_PROVIDER = 'OpenStreetMap.Mapnik'; // 'OpenStreetMap.France'

var OPERATORS = {
  "FREE":       { desc: "Free",   color: "purple" },
  "FREE INFRA": { desc: "Free",   color: "purple" },
  "ORANGE":     { desc: "Orange", color: "orange" },
  "SFR":        { desc: "SFR",    color: "red"    },
  "FTTH":       { desc: "FTTH",   color: "gray"   },
};


function createBaseLayer(map) {
    // create OpenStreetMap layer
    L.tileLayer.provider(BASEMAP_PROVIDER, {
        minZoom: 11,
        maxZoom: 18,
    }).addTo(map);
}

function createOverlay(map) {
    // prepare query
    var query = "https://data.toulouse-metropole.fr/api/v2/catalog/datasets/chantiers-en-cours/exports/geojson";
    var queryParams = {
        where: Object.keys(OPERATORS).map(function(v) { return 'declarant = "' + v + '"'; }).concat('nature LIKE "Telecom"').join(" OR "),
        rows: -1
    };
    
    // retrieve OpenData from the server
    $.getJSON(query, queryParams, function(data) {
        // create the layer
        L.geoJSON(data, {
            pointToLayer: function (geoJsonPoint, latlng) {
                var info = geoJsonPoint.properties;
                
                return L.circleMarker(latlng, {
                    color: (info.declarant in OPERATORS ? OPERATORS[info.declarant].color : 'green'),
                    fill: true,
                    radius : 8
                });
            },
            
            onEachFeature: function (feature, layer) {
                var info = feature.properties;
                var desc = (info.declarant in OPERATORS ? OPERATORS[info.declarant].desc : "Autre (" + info.declarant + ")");
                
                layer.bindPopup(L.popup().setContent(
                    "Opérateur: " + desc + "<br />" +
                    "Date: " + info.datedebut + " > " + info.datefin + " (" +
                             info.duree + " jours)<br />" +
                    "Adresse: " + info.voie + "<br />" +
                    "Entreprise: " + info.entreprise + "<br />" +
                    "Nature des travaux: " + info.nature));
            },
            
            attribution: '<a href="https://data.toulouse-metropole.fr">Toulouse Métropole</a>',
        }).addTo(map);
    });
}


function drawMap() {
    // create map centered on Toulouse
    var map = L.map('mapid').setView(new L.LatLng(43.604482, 1.443962), 12);
    
    // create layers
    createBaseLayer(map);
    createOverlay(map);
}
