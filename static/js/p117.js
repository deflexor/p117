$(document).ready(function () {

    function rebuttonButtons () {
        $("#editButton").button().click(editButtonHandler);
        $("#addButton").button().click(addButtonHandler);
    };

    var ajaxError = function (x,t,m) {
        alert('Server connection error');
    };

    function displaySelectedPage (pageId) {
        var res = "ok"
        $.ajax({
            type: "GET",
            url: "/mainpage/page",
            data: "pageId="+pageId,
            dataType: "html",
            error: function (x,t,m) {
                res = "fail";
                ajaxError(x,t,m);
            },
            success: function (ans) {
                $('#pageText').html(ans);
            },
        });
        return res;
    };

    function selectItem () {
        var pageId = this.getAttribute("data-pageid");
        var selectedItemId = $('#mainTree').attr("selectedItemId");
        if (pageId != selectedItemId) {
            var res = displaySelectedPage(pageId);
            if (res == "ok") {
                var selectedItemId = $('#mainTree').attr("selectedItemId");
                $('div.Content[data-pageid="'+selectedItemId+'"]').removeClass("SelectedItem");

                $('#mainTree').attr("selectedItemId", pageId);
                $('div.Content[data-pageid="'+pageId+'"]').addClass("SelectedItem");
            }
            else {
            }
        }
    };

    function editButtonHandler () {
        var selectedItemId = $('#mainTree').attr("selectedItemId");

        function submitPage () {
            var str = $("#editForm").serialize();
            // Save 'shortName' field to change it in tree
            var shortNameParam = $('#editForm > input[name="shortName"]').serializeArray();
            str = str + "&submit=Submit&pageId="+selectedItemId;
            $.ajax({
                type: "POST",
                url: "/mainpage/editpage",
                data: str,
                dataType: "json",
                error: ajaxError,
                success: function (ans) {
                    if (ans == "ok") {
                        displaySelectedPage(selectedItemId);
                        $('div.Content[data-pageid="'+selectedItemId+'"] > span.ItemText').html(shortNameParam[0].value);
                    }
                    else {
                    }
                },
            });

        };

        $.ajax({
            type: "GET",
            url: "/mainpage/editpage",
            data: "pageId="+selectedItemId,
            dataType: "html",
            error: ajaxError,
            success: function (ans) {
                $('#pageText').html(ans);
                $('#previewButton').button();
                $('#submitButton').button().click(submitPage);
            },
        });
    };


    var treeState = 0;
    $("div.Content").click(selectItem);

    rebuttonButtons();

    function saveTreeState () {
        var getIdState = function (index, element) {
            var id = $(element).attr("data-pageid");
            var liElem = $(element).parent();
            var state;
            if ($(liElem).hasClass('ExpandOpen')) {
                state = 'open';
            }
            if ($(liElem).hasClass('ExpandClosed')) {
                state = 'closed';
            }
            if ($(liElem).hasClass('ExpandLeaf')) {
                state = 'leaf';
            }
            return {id: id, state: state};
        };
        var itemsContent = $('#mainTree').find('div.Content');
        treeState = itemsContent.map(getIdState);
    };

    function restoreTreeState () {
        var restoreIdState = function (index, element) {
            var id = $(element).attr('data-pageid');
            var liElem = $(element).parent();
            for (var i=0; i < treeState.length; i++){
                if (treeState[i].id == id) {
                    var state = treeState[i].state;
                    if (state == "open") {
                        $(liElem).removeClass("ExpandClosed");
                        $(liElem).addClass("ExpandOpen");
                    }
                    if (state == "closed") {
                        $(liElem).removeClass("ExpandOpen");
                        $(liElem).addClass("ExpandClosed");
                    }
                }
            };
        };

        var itemsContent = $('#mainTree').find('div.Content');
        itemsContent.map(restoreIdState);
    };

    $('#testButton').button().click( function () {
        if (treeState == 0) {
            saveTreeState();
        }
        else {
            restoreTreeState();
        }
    });
})
