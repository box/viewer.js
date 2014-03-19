module('Component - page-svg', {
    setup: function () {
        var self = this;
        this.svgText = '<svg></svg>';
        this.utilities = {
            common: {
                isFn: function () {},
                ajax: function () {}
            },
            ajax: {
                request: function () {}
            }
        };
        this.scope = Crocodoc.getScopeForTest(this);

        this.component = Crocodoc.getComponentForTest('page-svg', this.scope);
        this.$el = $('<div>');
        this.config =  {
            viewerConfig: {},
            svgSrc: 'page.svg'
        };
        this.component.init(this.$el, this.config);
    }
});

test('preload() should create and insert the SVG object into the container element and make an ajax request when called (using proxy svg)', function () {
    var initalHTML = this.$el.html();
    this.mock(this.utilities.ajax)
        .expects('request')
        .withArgs(this.config.svgSrc, sinon.match.object);
    this.component.preload();
    ok(this.$el.html() !== initalHTML, 'the element has been inserted');
});
