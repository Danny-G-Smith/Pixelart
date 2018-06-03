jQuery( document ).ready( function ( $ ) {

   'use strict';

   const EMPTY          = "empty";
   const $colorPicker   = $( "#colorPicker" );
   const $sizePicker    = $( "#sizePicker" );
   const $inputWidth    = $( "#inputWidth" );
   const $inputHeight   = $( "#inputHeight" );
   const $pixelCanvas   = $( "#pixel_canvas" );
   const $canvasName    = $( "#canvas-name" );
   const $savedCanvases = $( "#saved-canvases" );
   const $savedCanvase  = $( "#savedCanvase" );

   let width  = 0;
   let height = 0;
   let savedCanvases = [];

   /**
    * This function creates the grid given width and height.
    *
    * @pparam width
    *
    * @pparam height
    */
   function makeGrid( width, height ) {
      let grid = "";

      const table = document.getElementById( "pixel_canvas" );
      if ( table.firstChild ) {
         while ( table.firstChild ) {
            table.removeChild( table.firstChild );
         }
      }

      for ( let y = 0; y < height; y++ ) {
         // inserts y rows into the table
         const row = pixel_canvas.insertRow( y );
         for ( let x = 0; x < width; x++ ) {
            // inserts x cells into each of the rows
            const cell = row.insertCell( x );
            //cell.addEventListener( "click", function ( $ ) {
            //   fillBox( cell, color );
            //} );
         }
      }
   }

   /**
    * Workhorse function that has other functions passed to it,
    * such as eraseGrid, saveGrid, and loadGrid
    *
    * @pparam callback such as loadGrid
    *
    * @pparam data based on callback
    */
   function processCanvas( callback, data ) {

      $pixelCanvas.find( "tr" ).each( function ( row, rElem ) {
         $( rElem ).find( "td" ).each( function ( col, cElem ) {
            if ( typeof callback === "function" ) {
               callback( cElem, data, row, col );
            }
         } );
      } );
   }

   /**
    * See processCanvas
    */
   function eraseGrid( elem ) {
      $( elem ).css( { "background-color": "" } );
   }

   /**
    * See processCanvas
    */
   function saveGrid( elem, data ) {
      const $elem = $( elem );
      let cellVal = "";

      if ( $elem.attr( "style" ) ) {
         cellVal = $elem.css( "background-color" );
      } else { // bg color is undefined
         cellVal = EMPTY;
      }

      data.push( cellVal );
   }

   /**
    * See processCanvas
    */
   function loadGrid( elem, data, row, col ) {
      let idx = (row * Math.max( width, height )) + col; // treat 1D array as 2D

      if ( data[idx] !== EMPTY ) {
         $( elem ).css( { "background-color": data[idx] } );
      } else {
         $( elem ).css( { "background-color": "" } );
      }

   }

   /**
    * Add data to an json like data structure.
    * Data only persists until next browser refresh.
    *
    * @pparam data
    */
   function addSavedCanvas( data ) {
      let saveAs = $canvasName.val();
      let canvasId = savedCanvases.length;
      let formTemp = `<div class="form-group addSaved">
                         <!--<label for="${canvasId}">${saveAs}</label>-->
                         <input type="submit" name="${canvasId}" id="${canvasId}" 
                         class="waves-effect waves-light btn orange" value="Load ${saveAs}">
                         <i class="material-icons input_img">file_download</i>
                    </div>`;

      if ( savedCanvases.length === 0 ) {
         $savedCanvases.find( ".empty-message" ).remove();
      }

      savedCanvases[canvasId] = data;
      $savedCanvases.append( formTemp );
   }

   /**
    * Removed saved json data
    *
    */
   function removeSavedCanvases() {
      $savedCanvases.find( ".form-group" ).remove();
      savedCanvases = [];

      // prevent appending multiple empty messages if "Remove all" is clicked
      // and the empty message already exists
      if ( $savedCanvases.children( ".empty-message" ).length === 0 && savedCanvases.length === 0 ) {
         $( '<p class="empty-message">No saved canvases</p>' ).appendTo( $savedCanvases );
      }
   }
   // ***************************************************************************
   //
   // No functions below, events, etc.
   //
   // ***************************************************************************

   $sizePicker.submit( function ( event ) {
      event.preventDefault();
      width  = $inputWidth.val();
      height = $inputHeight.val();
      //removeRecentColor();
      //removeSavedCanvases();
      let color = $colorPicker.val( '#ee6e73' );
      makeGrid( width, height );
   } );

   // avoid binding event handlers to each grid element,
   // use event delegation instead
   $pixelCanvas.on( "click", "td", function ( event ) {
      let $target = $( event.target );
      let color = $colorPicker.val( '#ee6e73' );

      if ( event.altKey ) {
         if ( $target.attr( "style" ) ) { // make sure there's a background-color
            $colorPicker.val( $target.css( "background-color" ) );
         }
         return;
      }

      if ( event.shiftKey ) {
         $target.css( { "background-color": "" } );
      } else {
         $target.css( { "background-color": color } );
      }
   } );

   // allow dragging to paint:
   //     mouseout captures the element that was under the cursor when mousedown event was triggered,
   //     otherwise it's missed
   $( document ).mousedown( function ( event ) {
      // disable shift + click functionality of the browser to prevent highlighting/selecting
      // all text while shift + clicking to remove colors
      // check the shift key is pressed to prevent not being able to select text boxes
      // when you're not shift + clicking
      // see: https://stackoverflow.com/questions/1527751/disable-text-selection-while-pressing-shift
      if ( event.shiftKey ) {
         event.preventDefault();
      }

      $pixelCanvas.on( "mouseover mouseout", "td", function ( event ) {
         if ( event.shiftKey ) {
            $( this ).css( { "background-color": "" } );
         } else {
            $( this ).css( { "background-color": $colorPicker.val() } );
            //addRecentColor( $colorPicker.val() );
         }
      } );
   } ).mouseup( function () {
      $pixelCanvas.off( "mouseover mouseout" );
   } );

   $( "#canvas-form" ).on( "click", function ( event ) {
      event.preventDefault();
      let mode = $( event.target ).val().toLowerCase();

      if ( mode === "erase" ) {
         processCanvas( eraseGrid );
      } else if ( mode === "save" ) {
         let tableVals = [];

         if ( $canvasName.val().length === 0 ) {
            alert( "Please enter a canvas name." );
            return;
         }
         processCanvas( saveGrid, tableVals );
         addSavedCanvas( tableVals );
      }
   } );

   $savedCanvases.on( "click", "input", function ( event ) {
      event.preventDefault();
      let canvasId = $( event.target ).attr( "id" );
      processCanvas( loadGrid, savedCanvases[ canvasId ] );
   } );

   $( "#remove-saved-canvases" ).on( "click", function ( event ) {
      event.preventDefault();
      removeSavedCanvases();
   } );

   $sizePicker.trigger( "submit" );

   $(".override").spectrum({
      color: "#ee6e73"
   });

   $( "#colorPicker" ).spectrum({
      color: "#ee6e73",
      showInput: true,
      className: "full-spectrum",
      showInitial: true,
      showPalette: true,
      showSelectionPalette: true,
      maxSelectionSize: 10,
      preferredFormat: "hex",
      localStorageKey: "spectrum.dgs",
      move: function (color) {

      },
      show: function () {

      },
      beforeShow: function () {

      },
      hide: function () {

      },
      change: function() {

      },
      palette: [
         // base      lighten-4  lighten-3  lighten-2  lighten-1  darken-1   darken-2   darken-3   darken-4
         [ "#e51c23", "#f8c1c3", "#f3989b", "#ee6e73", "#ea454b", "#d0181e", "#b9151b", "#a21318", "#8b1014" ],
         [ "#F44336", "#FFCDD2", "#EF9A9A", "#E57373", "#EF5350", "#E53935", "#D32F2F", "#C62828", "#B71C1C" ],
         [ "#e91e63", "#f8bbd0", "#f48fb1", "#f06292", "#ec407a", "#d81b60", "#c2185b", "#ad1457", "#880e4f" ],
         [ "#9c27b0", "#e1bee7", "#ce93d8", "#ba68c8", "#ab47bc", "#8e24aa", "#7b1fa2", "#6a1b9a", "#4a148c" ],
         [ "#673ab7", "#d1c4e9", "#b39ddb", "#9575cd", "#7e57c2", "#5e35b1", "#512da8", "#4527a0", "#311b92" ],
         [ "#3f51b5", "#c5cae9", "#9fa8da", "#7986cb", "#5c6bc0", "#3949ab", "#303f9f", "#283593", "#1a237e" ],
         [ "#2196F3", "#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#1E88E5", "#1976D2", "#1565C0", "#0D47A1" ],
         [ "#03a9f4", "#b3e5fc", "#81d4fa", "#4fc3f7", "#29b6f6", "#039be5", "#0288d1", "#0277bd", "#01579b" ],
         [ "#00bcd4", "#b2ebf2", "#80deea", "#4dd0e1", "#26c6da", "#00acc1", "#0097a7", "#00838f", "#006064" ],
         [ "#009688", "#b2dfdb", "#80cbc4", "#4db6ac", "#26a69a", "#00897b", "#00796b", "#00695c", "#004d40" ],
         [ "#4CAF50", "#C8E6C9", "#A5D6A7", "#81C784", "#66BB6A", "#43A047", "#388E3C", "#2E7D32", "#1B5E20" ],
         [ "#8bc34a", "#dcedc8", "#c5e1a5", "#aed581", "#9ccc65", "#7cb342", "#689f38", "#558b2f", "#33691e" ],
         [ "#cddc39", "#f0f4c3", "#e6ee9c", "#dce775", "#d4e157", "#c0ca33", "#afb42b", "#9e9d24", "#827717" ],
         [ "#ffeb3b", "#fff9c4", "#fff59d", "#fff176", "#ffee58", "#fdd835", "#fbc02d", "#f9a825", "#f57f17" ],
         [ "#ffc107", "#ffecb3", "#ffe082", "#ffd54f", "#ffca28", "#ffb300", "#ffa000", "#ff8f00", "#ff6f00" ],
         [ "#ff9800", "#ffe0b2", "#ffcc80", "#ffb74d", "#ffa726", "#fb8c00", "#f57c00", "#ef6c00", "#e65100" ],
         [ "#ff5722", "#ffccbc", "#ffab91", "#ff8a65", "#ff7043", "#f4511e", "#e64a19", "#d84315", "#bf360c" ],
         [ "#795548", "#d7ccc8", "#bcaaa4", "#a1887f", "#8d6e63", "#6d4c41", "#5d4037", "#4e342e", "#3e2723" ],
         [ "#607d8b", "#cfd8dc", "#b0bec5", "#90a4ae", "#78909c", "#546e7a", "#455a64", "#37474f", "#263238" ],
         [ "#9e9e9e", "#f5f5f5", "#eeeeee", "#e0e0e0", "#bdbdbd", "#757575", "#616161", "#424242", "#212121" ],
         [ "#FFFFFF", "#000000"]
      ]
   });

} );