module('Component - layout-text', {
    setup: function () {
        var self = this;
        this.utilities = {
            common: Crocodoc.getUtilityForTest('common')
        };
        this.config = {
            $el: $(),
            $viewport: $('<div>'),
            $doc: $('<table>'),
            minZoom: 0.01,
            maxZoom: 5,
            zoomLevels: [0.5, 1, 1.5, 5]
        };
        this.scope = Crocodoc.getScopeForTest(this);

        this.component = Crocodoc.getComponentForTest('layout-text', this.scope);
    }
});

QUnit.cases([
    { prevZoom: 0.5, zoom: 1.5, canZoomIn: true, canZoomOut: false },
    { prevZoom: 1.5, zoom: 1.5, canZoomIn: true, canZoomOut: true },
    { prevZoom: 1, zoom: 5, canZoomIn: false, canZoomOut: false }
]).test('setZoom() should update the zoom state appropriately when called', function (params) {
    var calculateNextZoomLevelStub = this.stub(this.component, 'calculateNextZoomLevel');
    calculateNextZoomLevelStub.withArgs(Crocodoc.ZOOM_IN).returns(params.canZoomIn);
    calculateNextZoomLevelStub.withArgs(Crocodoc.ZOOM_OUT).returns(params.canZoomOut);

    this.component.init();
    this.component.state.zoomState.zoom = params.prevZoom;

    this.component.setZoom(params.zoom);

    equal(this.component.state.zoomState.zoom, params.zoom, 'zoom was updated');
    equal(this.component.state.zoomState.prevZoom, params.prevZoom, 'prevZoom was updated');
    equal(this.component.state.zoomState.canZoomIn, params.canZoomIn , 'canZoomIn was updated');
    equal(this.component.state.zoomState.canZoomOut, params.canZoomOut, 'canZoomOut was updated');
});
