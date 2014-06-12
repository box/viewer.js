// Let's add a `page-content` plugin that binds to the viewer and
// inserts content into each page element.
Crocodoc.addPlugin('page-content', function (scope) {
    var DEFAULT_INFO = 'I don\'t know anything about this page...';

    // get some common utility functions to work with
    var util = scope.getUtility('common');

    var config = {
            defaultInfo: DEFAULT_INFO,
            template: '',
            pageInfos: []
        },
        currentPage = null,
        $pages = $(),
        $viewport = $();

    // function that gets called when the "Info" button is clicked
    function showPageInfo(pageNum) {
        hidePageInfo();
        $pages.eq(pageNum - 1).addClass('page-content-flipped');
        currentPage = pageNum;
    }

    // function that gets called when the user clicks out or scrolls
    function hidePageInfo() {
        if (currentPage !== null) {
            $pages.eq(currentPage - 1).removeClass('page-content-flipped');
            currentPage = null;
        }
    }

    // render the template and insert it into the given page
    function insertContent(pageNum) {
        var $page = $pages.eq(pageNum - 1).find('.crocodoc-page-inner');
        var $content = $(util.template(config.template, {
            pageInfo: config.pageInfos[pageNum - 1] || config.defaultInfo
        }));

        $page.append($content);
        // listen for click events on the buttons
        $page.find('.front').on('click', function (event) {
            showPageInfo(pageNum);
            event.stopPropagation();
        });
    }

    // hide page info when the user clicks outside a page
    function handleMousedown(event) {
        if (currentPage === null) {
            return;
        }
        if (!$.contains($pages[currentPage - 1], event.target)) {
            hidePageInfo();
        }
    }

    // the plugin's public interface
    // init, onmessage and destroy are called by the framework when appropriate
    return {
        // this plugin listens for the following messages
        messages: ['ready', 'pageload'],

        // insert content into each page as it loads
        onmessage: function (name, data) {
            switch (name) {
                case 'ready':
                    // $pages won't be available until the 'ready' message is broadcas
                    var viewerConfig = scope.getConfig();
                    $pages = viewerConfig.$pages;
                    $viewport = viewerConfig.$viewport;
                    $viewport.on('mousedown', handleMousedown);
                    break;
                case 'pageload':
                    if ($pages.eq(data.page - 1).find('.page-content').length === 0) {
                        insertContent(data.page);
                    }
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
            $viewport.off('mousedown', handleMousedown);
        }
    };
});
