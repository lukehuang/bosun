interface IHistoryScope extends IBosunScope {
	ak: string;
	alert_history: any;
	error: string;
	shown: any;
	collapse: (i: any) => void;
	dtqs: (dt: string) => string;
}

bosunControllers.controller('HistoryCtrl', ['$scope', '$http', '$location', '$route', function($scope: IHistoryScope, $http: ng.IHttpService, $location: ng.ILocationService, $route: ng.route.IRouteService) {
	var search = $location.search();
	var keys: any = {};
	if (angular.isArray(search.key)) {
		angular.forEach(search.key, function(v) {
			keys[v] = true;
		});
	} else {
		keys[search.key] = true;
	}
	var status: any;
	$scope.shown = {};
	$scope.collapse = (i: any) => {
		$scope.shown[i] = !$scope.shown[i];
	};
	$scope.dtqs = (dt: string) => {
		var m = moment.utc(dt, timeFormat);
		return "&date=" + encodeURIComponent(m.format("YYYY-MM-DD")) + "&time=" + encodeURIComponent(m.format("HH:mm"));
	}
	var params = Object.keys(keys).map((v: any) => { return 'key=' + encodeURIComponent(v); }).join('&');
	$http.get('/api/alerts/details?' + params)
		.success((data) => {
			var selected_alerts: any[] = [];
			angular.forEach(data, function(v, ak) {
				if (!keys[ak]) {
					return;
				}
				v.History.map((h: any) => { h.Time = moment.utc(h.Time); });
				angular.forEach(v.History, function(h: any, i: number) {
					if (i + 1 < v.History.length) {
						h.EndTime = v.History[i + 1].Time;
					} else {
						h.EndTime = moment.utc();
					}
				});
				selected_alerts.push({
					Name: ak,
					History: v.History.reverse(),
				});
			});
			if (selected_alerts.length > 0) {
				$scope.alert_history = selected_alerts;
			} else {
				$scope.error = 'No Matching Alerts Found';
			}
		});
}]);
