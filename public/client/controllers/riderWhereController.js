angular.module('appModule')
.controller('riderWhereController', function($scope, $http, $location, geocodeServices){
  navigator.geolocation.getCurrentPosition(function(position){
    riderLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };    
  });
  $scope.submitRider = function(){
    geocodeServices.getCoords($scope.carLocation)
    .then(function(carLocation){
      $http({
        method: "POST",
        url: "/rider/new",
        data: {
          riderLocation: riderLocation,
          carLocation: carLocation
        }
      }).success(function(){
        $location.path('/rider/wait');
      }).error(function(err){
        $scope.err = {
          reason: err
        }
      })
    },
    function(){
      $scope.err = {
        reason: "We don't recognize that location!"
      }
    });
  }
  $scope.focused = false;
  $scope.toggleFocus = function(){
    $scope.focused = !$scope.focused;
  }

  $scope.mapOptions = {
    center: new google.maps.LatLng(37.7749295, -122.4194155),
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var findMarkerAddress = function(evt) {
     var coord = {};
     coord.lat = evt.latLng.lat().toFixed(3);
     coord.lng = evt.latLng.lng().toFixed(3);

     geocodeServices.getAddress(coord)
     .then(function(address) {
      $scope.carLocation = address;
    })
  };

  $scope.addMarkerToMap = function(latLng) {

    if ($scope.markerOnMap !== undefined) {
      $scope.markerOnMap.setMap(null);

    }
    
    $scope.markerOnMap = new google.maps.Marker({
      map: $scope.myMap,
      position: latLng,
      draggable:true,
      animation: google.maps.Animation.DROP,
    });


    google.maps.event.addListener($scope.markerOnMap, 'dragend', findMarkerAddress);
    google.maps.event.addListener($scope.markerOnMap, 'drag', findMarkerAddress);

    $scope.myMap.setZoom(15);
    $scope.myMap.panTo($scope.markerOnMap.position);
  };
  
  $scope.createMarker = function(lat, lng) {
    var latLng = new google.maps.LatLng(lat, lng);
    $scope.addMarkerToMap(latLng);
  };

  $scope.addMarker = function($event, $params) {
    $scope.addMarkerToMap($params[0].latLng);
    var coord = {};
    coord.lat = $params[0].latLng.lat();
    coord.lng = $params[0].latLng.lng();
    geocodeServices.getAddress(coord)
    .then(function(address) {
      $scope.carLocation = address;
    })

  };    

  $scope.showCarLocation = function () {
    geocodeServices.getCoords($scope.carLocation)
    .then(function(carLocation) {
      $scope.createMarker(carLocation.lat, carLocation.lng);
    })    
  };

  $scope.home = function(){
    $location.path('/');
  };

});
