angular.module('app', ['gridster', 'picardy.fontawesome'])
.controller('GridController', ['$scope', function($scope) {
	$scope.gridGridsterOpts = {
		columns: 12, // number of columns in the grid
		pushing: true, // whether to push other items out of the way
		floating: true, // whether to automatically float items up so they stack
		swapping: true, // whether or not to have items switch places instead of push down if they are the same size
		width: 'auto', // width of the grid. "auto" will expand the grid to its parent container
		colWidth: 'auto', // width of grid columns. "auto" will divide the width of the grid evenly among the columns
		rowHeight: 'match', // height of grid rows. 'match' will make it the same as the column width, a numeric value will be interpreted as pixels, '/2' is half the column width, '*5' is five times the column width, etc.
		margins: [5, 5], // margins in between grid items
		outerMargin: false,
		isMobile: false, // toggle mobile view
		mobileBreakPoint: 0, // width threshold to toggle mobile mode
		mobileModeEnabled: false, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
		minColumns: 1, // minimum amount of columns the grid can scale down to
		minRows: 1, // minimum amount of rows to show if the grid is empty
		maxRows: 100, // maximum amount of rows in the grid
		defaultSizeX: 4, // default width of an item in columns
		defaultSizeY: 1, // default height of an item in rows
		minSizeX: 1, // minimum column width of an item
		maxSizeX: 12, // maximum column width of an item
		minSizeY: 1, // minumum row height of an item
		maxSizeY: 1, // maximum row height of an item
		saveGridItemCalculatedHeightInMobile: false, // grid item height in mobile display. true- to use the calculated height by sizeY given
		resizable: { // options to pass to resizable handler
			enabled: true,
			handles: ['e', 'w']
		},
		draggable: { // options to pass to draggable handler
			enabled: true,
			scrollSensitivity: 20, // Distance in pixels from the edge of the viewport after which the viewport should scroll, relative to pointer
			scrollSpeed: 15 // Speed at which the window should scroll once the mouse pointer gets within scrollSensitivity distance
		}
	};


	$scope.gridFrameworkOptions = [
		{ label: 'bootstrap',  value: 'bootstrap' },
		{ label: 'foundation', value: 'foundation' },
		{ label: 'json', value: 'json' },
	];

	$scope.screenSizeOptions = [
		{ label: 'large',   value: 'lg' },
		{ label: 'medium',  value: 'md' },
		{ label: 'small',   value: 'sm' },
		{ label: 'x-small', value: 'xs' },
	];

	$scope.gridItems = [];
	
	$scope.viewport = {
		lg: [],
		md: [],
		sm: [],
		xs: [],
		framework: $scope.gridFrameworkOptions[0],
		size: $scope.screenSizeOptions[0]
	};

	$scope.markup = '';

	$scope.gridItems = $scope.viewport[$scope.screenSizeOptions[0].value];

	$scope.addGridItem = function () {
		var item = {
			id: 'id' + $scope.gridItems.length,
			name: $scope.gridItems.length,
			size: $scope.viewport.size.value,
			sizeX: 4,
			sizeY: 1
		};

		$scope.gridItems.push(item);
	};

	$scope.removeGridItem = function (item) {
		var i = $scope.gridItems.indexOf(item);
		if(i !== -1) {
			$scope.gridItems.splice(i, 1);
		}
	}

	$scope.screenSizeChange = function (s) {
		
		if(s != undefined) {
			$scope.viewport.size = s;
			$scope.gridItems = $scope.viewport[s.value];
		} else {
			$scope.gridItems = $scope.viewport[$scope.viewport.size.value];
		}
	}

	$scope.changeNameGridItem = function (item, v) {
		item.name = v;
	}

	$scope.renderGrid = function () {
		var item,
			size = 'lg',
			items = $scope.viewport['lg'].slice(),
			rows = [],
			row = [],
			o = 0,
			ps,
			po,
			compareCol = function (a,b) {
				if (a.col < b.col) return -1;
				if (a.col > b.col) return 1;
				return 0;
			},
			compareRow = function (a,b) {
				if (a.row < b.row) return -1;
				if (a.row > b.row) return 1;
				return 0;
			};

		// sort item  on col then row to reflect elements order
		items.sort(compareCol).sort(compareRow);

		while(item = items.pop()) {
			// init properties object span and offset
			ps = {lg: 0, md: 0, sm: 0, xs: 0};
			po = {lg: 0, md: 0, sm: 0, xs: 0};

			angular.forEach($scope.screenSizeOptions, function(s, i) {
				var sv = s.value,
					e = $scope.viewport[sv],
					p;
				
				// offset
				if ( e[items.length] != undefined) {
					e.sort(compareCol).sort(compareRow);

					if(e[items.length].col != 0         // check if element not in first col
						&& (p = e[items.length-1])      // check if it's not the before-last element in the items array
						&& e[items.length].row == e[items.length-1].row) { // check if current element and element before have the same row

						po[sv] = Math.max(e[items.length].col - (e[items.length-1].col + e[items.length-1].sizeX), 0);

					} else {
						po[sv] = e[items.length].col;
					}

					// spans
					ps[sv] = e[items.length].sizeX;
				}
			});

			// push name, spans and offset into row
			// TODO: add more attributes, like specialClasses, hidden, pull/push(?)
			row.push({
				name: item.name,
				span:   { lg: ps.lg, md: ps.md, sm: ps.sm, xs: ps.xs },
				offset: { lg: po.lg, md: po.md, sm: po.sm, xs: po.xs }
			});

			// TODO: change the way the column are organized, actually they are done according to the lg size (idea?!!)
			if((p = items[items.length-1]) && item.row != p.row ) { // new row!
				// push the row into the rows array
				rows.push(row);
				// init new row
				row = [];

			} else if(items.length == 0){ // the end of the array
				// push the last row
				rows.push(row);
			}
		}
		
		return rows;
	};

	$scope.renderHTMLGrid = function () {
		var rows;

		if(rows = $scope.renderGrid()) {

			var html = '',
				cols, col, classes;
			
			switch($scope.viewport.framework.value) {
				case 'bootstrap':
					html += '\n<div class="container">';
					while(cols = rows.pop()) {
						// begin row
						html += '\n  <div class="row">';

						while(col = cols.pop()) {
							// classes conlonne definition
							classes = '';
							angular.forEach($scope.screenSizeOptions, function(s, i) {
								var size = s.value;

								// span
								classes += ( col.span[size] != 0 ? ' col-' + size + '-' + col.span[size] : '' );
								// offset
								classes += ( col.offset[size] != 0 ? ' offset-' + size + '-' + col.offset[size] : '' );
							});
							// generate colomumn markup
							html += '\n    <div class="' + classes.trim() + '">\n      <span>' + col.name + '</span>\n  </div>';
						}

						// close row
						html += '\n  </div>';
					}

					// close container
					html += '\n</div>';

				break;
				case 'foundation':
					html = 'Not implemented yet';

				case 'json':
					html = 'Not implemented yet';

				break;
			}

			$scope.markup = html;
		} else {
			$scope.markup = 'nothing to show';
		}


	}

	$scope.$watch('gridItems', function(items){
		// console.log('items changed', items);

		var size = $scope.viewport.size.value,
			l = $scope.viewport[size].length;

		angular.forEach($scope.screenSizeOptions, function(s, j) {
			var sv = s.value;

			if(sv != size) {

				if($scope.viewport[sv].length > l) {
					// filter the current array of items on the id attribute
					$scope.viewport[sv] = $scope.viewport[sv].filter(function(value, index, array){
						var f = false,
							id = value.id;

						angular.forEach($scope.viewport[size], function(e, k) {
							if( e.id == id) {
								f = true;
								return;
							}
						});
						return f;
					});


				} else if($scope.viewport[sv].length < l) {
					// add item
					var i = $scope.viewport[size][$scope.viewport[size].length-1];
					
					if( i.col != undefined && i.row != undefined ) {
						var ci = {};
						angular.copy(i, ci)
						ci.size = sv;
						$scope.viewport[sv].push(ci);
					}

				} else {
					
					angular.forEach($scope.viewport[sv], function(e, k) {
						e.name = $scope.viewport[size][k].name;
					});
				}
			}
		});

		$scope.renderHTMLGrid();

	}, true);

}]);
