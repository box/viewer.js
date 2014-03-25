// Let's add a `page-content` plugin that binds to the viewer and
// inserts content into each page element.
Crocodoc.addPlugin('page-content', function (scope) {
    var util = scope.getUtility('common');

    var config = {
            template: ''
        },
        $pages;

    // function that gets called when the "Add Page" button is clicked
    function addPage(pageNum) {
        $pages.eq(pageNum - 1).addClass('page-content-added');
    }

    // function that gets called when the "Remove Page" button is clicked
    function removePage(pageNum) {
        $pages.eq(pageNum - 1).removeClass('page-content-added');
    }

    // render the template and insert it into the given page
    function insertContent(pageNum) {
        var $pageOverlay = $pages.eq(pageNum - 1).find('.crocodoc-page-autoscale');
        var $content = $(util.template(config.template, {
            pageNum: pageNum
        }));

        // listen for click events on the buttons
        $content.find('.add-page-btn').on('click', function (event) {
            addPage(pageNum);
            event.stopPropagation();
        });
        $content.find('.remove-page-btn').on('click', function (event) {
            removePage(pageNum);
            event.stopPropagation();
        });

        $pageOverlay.append($content);
    }

    // the plugin's public interface
    // init, onmessage and destroy are called by the framework when appropriate
    return {
        // this plugin listens for the 'pageload message'
        messages: ['ready', 'pageload'],

        // insert content into each page as it loads
        onmessage: function (name, data) {
            switch (name) {
                case 'ready':
                    // $pages won't be available until the 'ready' message is broadcas
                    $pages = scope.getConfig().$pages;
                    break;
                case 'pageload':
                    insertContent(data.page);
                    break;
            }
        },

        // initialize config and $pages object
        init: function (pluginConfig) {
            config = util.extend(config, pluginConfig);
        },

        // remove all page content when destroyed
        destroy: function () {
            $pages.find('.page-content').remove();
        }
    };
});
