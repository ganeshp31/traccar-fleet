(function() {
    'use strict';

    angular
        .module('fleetApp')
        .controller('DeviceController', DeviceController);

    DeviceController.$inject = ['$scope', '$state', 'Device', 'Traccar', 'ParseLinks', 'AlertService', 'pagingParams', 'paginationConstants'];

    function DeviceController ($scope, $state, Device, Traccar, ParseLinks, AlertService, pagingParams, paginationConstants) {
        var vm = this;

        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.transition = transition;

        loadAll();

        function loadAll () {
            Device.query({
                page: pagingParams.page - 1,
                size: paginationConstants.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
            function sort() {
                var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
                if (vm.predicate !== 'id') {
                    result.push('id');
                }
                return result;
            }
            function onSuccess(data, headers) {
                vm.links = ParseLinks.parse(headers('link'));
                vm.totalItems = headers('X-Total-Count');
                vm.queryCount = vm.totalItems;
                vm.devices = data;
                vm.page = pagingParams.page;
            }
            function onError(error) {
                AlertService.error(error.data.message);
            }
        }

        function loadPage (page) {
            vm.page = page;
            vm.transition();
        }

        vm.importFromTraccar = function() {
            Traccar.importDevices(onSuccess, onError);
            function onSuccess(data, headers) {
                AlertService.success(data);
                loadAll();
            }
            function onError(error) {
                AlertService.error(error.data.message);
            }
        };

        function transition () {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                search: vm.currentSearch
            });
        }
    }
})();
