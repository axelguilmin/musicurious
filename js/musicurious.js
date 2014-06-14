// Utils ////////////////////////////////

var GET = {}
location.search.substr(1).split("&").forEach(function(item) {
  GET[item.split("=")[0]] = item.split("=")[1]
});

var baseURL = document.location.protocol + '//' + document.location.host + document.location.pathname;

// Functions ////////////////////////////////

// Show the correct menu
function showMenu(menu){
  $('.menu').stop(true).not(menu).fadeOut(500);
  $(menu).delay(500).fadeIn(500);
}

// Gather Wikipedia information
function loadWikipedia(region)
{
  $.ajax({
    type: "GET",
    url: "http://" + region.wikipediaLocalization + ".wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + region.wikipediaPage + "&callback=?",
    contentType: "application/json; charset=utf-8",
    async: true,
    dataType: "json",
    success: function (data, textStatus, jqXHR) {

      var markup = data.parse.text["*"];
      var blurb = $('#wiki #article').html(markup);

      // remove links as they will not work
      blurb.find('a').each(function() { 
        $(this).replaceWith($(this).html()); 
      });

      // remove any references
      blurb.find('sup').remove();

      // remove cite error
      blurb.find('.mw-ext-cite-error').remove();

      // remove style attributes from wikipedia
      blurb.find('*').css("background-color", '');

      // remove ... something ... sometimes
      blurb.find('#good-star, .plainlinks, .noprint, .thumbcaption').remove();

      // Update title and read more link
      $('#wiki h1').html('<span class="flaticon-big40"></span>' + region.title);

      // Add "read more" link
      $('#article').append('<p style="clear: both"><a href="http://' + region.wikipediaLocalization + '.wikipedia.org/wiki/' + region.wikipediaPage + '" target="_blank">Read more on Wikipedia</a></p>');
    },
    error: function (errorMessage){
      // @todo
    }
  });
}

// Initialization ////////////////////////////////

$(function(){

  // Load data
  var regionsFile = GET['r'];
  var mapName = GET['m'];

  if(regionsFile && mapName)
  $.getJSON(baseURL + '/../json/' + regionsFile + '.json', function (data) {

    var regions = data;
    $.each( regions, function( key, region ) {
      if(region.wikipediaLocalization === undefined)
        region.wikipediaLocalization = 'en';
    });

    $('#mapselect').hide();
    showMenu('#menumap');

    // Generate the map
    $('#map').vectorMap({
      onRegionClick: function(event, code){
        if(regions[code]){
          // Show the video
          $('#player #citation').empty();
          $("#player").tubeplayer("play", regions[code].youtubeId);

          // Load wikipedia
          loadWikipedia(regions[code]);

          // Scroll to the reader
          $('html, body').stop().animate({
            scrollTop: $("#player").offset().top
          }, 500);

          showMenu('#menuplayer'); 
          $('#resume').delay(500).show(0);
        }
        else
        {
          alert('No music for this region for ' + code);
        }
      },
      map: mapName,
      focusOn:{
        x: 0.5,
        y: 0.5,
        scale: 1
      },
      backgroundColor: 'transparent',
      regionsSelectable: true,
      regionsSelectableOne: true,
      zoomOnScroll: false,
      zoomButtons : false,
      regionStyle:{
        initial:{
          fill: 'rgba(255,255,255,0.8)',
          "fill-opacity": 0.8,
          stroke: 'none',
          "stroke-width": 1,
          "stroke-opacity": 1
        },
        hover:{
          fill: 'rgba(255,255,255,1.0)',
          "fill-opacity": 1
        },
        selected:{
          fill: '#ffffff',
          "fill-opacity": 1
        },
        selectedHover:{
        }
      }
    });
  });
  
  // Preload player
  $("#player").tubeplayer({
    width: '100%', // the width of the player
    height: '100%', // the height of the player
    initialVideo: '', // the video that is loaded into the player
    allowFullScreen: false, // true by default, allow user to go full screen
    modestbranding: true, // specify to include/exclude the YouTube watermark
    showControls: 0, // whether the player should have the controls visible, 0 or 1
    showRelated: 0, // show the related videos when the player ends, 0 or 1 
    wmode: 'gpu', // note: transparent maintains z-index, but disables GPU acceleration
    iframed: true, // iframed can be: true, false; if true, but not supported, degrades to flash
    onPlay: function(id){}, // after the play method is called
    onPause: function(){}, // after the pause method is called
    onStop: function(){}, // after the player is stopped
    onSeek: function(time){}, // after the video has been seeked to a defined point
    onMute: function(){}, // after the player is muted
    onUnMute: function(){} // after the player is unmuted
  });

  // Show first menu
  $('#resume').hide(0);
  showMenu(''); 

// Buttons ////////////////////////////////

  // Stop player
  $('#stop').on("click", function(){

    showMenu('#menumap'); 

    $('#map').vectorMap('get', 'mapObject').clearSelectedRegions();
    $('html, body').stop().animate({
            scrollTop: $('#map').offset().top
          }, 500);
    return false;
  });

  // At loading / refresh, scroll to top
  $('html, body').scrollTop(0);
  $(window).unload(function() {
    $('html, body').scrollTop(0);
  });

  $('#zoomin').click(function(){
    var map = $('#map').vectorMap('get', 'mapObject');
    map.setScale(map.scale * map.params.zoomStep, map.width / 2, map.height / 2);
  });

  $('#zoomout').click(function(){
    var map = $('#map').vectorMap('get', 'mapObject');
    map.setScale(map.scale / map.params.zoomStep, map.width / 2, map.height / 2);
  });

  $('#resume').click(function(){
    $('html, body').animate({
      scrollTop: $('#player').offset().top
    }, 500);
     showMenu('#menuplayer'); 
  });

  $('#more').click(function(){
    $('html, body').animate({
      scrollTop: $('#wiki').offset().top
    }, 500);
    showMenu('#menuwiki');
  });

  $('#less').click(function(){
    $('html, body').animate({
      scrollTop: $('#player').offset().top
    }, 500);
    showMenu('#menuplayer');
  });

  $('#share').click(function(){
    alert('Sharing with <3 is coming soon');
  });
});