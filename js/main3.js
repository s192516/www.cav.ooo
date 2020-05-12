(function($) {
  'use strict';

  function ulcGetLinksList(getObj, element, template, action) {
    if (parseInt(getObj.page) >= -1) {
      element.addClass('ulc-loading');
      return $.ajax({
        type: 'GET',
        url: ulcSettingsObj.ajaxurl,
        dataType: 'json',
        data: {
          action: action ? action : 'ulc_get_links',
          post_type: getObj.post_type,
          category_id: getObj.category_id,
          per_page: getObj.per_page,
          order_by: getObj.order_by,
          order: getObj.order,
          page: getObj.page,
          is_likes: getObj.is_likes,
          is_likes_count: getObj.is_likes_count,
          token: ulcSettingsObj.token,
        },
        success: function(data) {
          var dataJson = data;
          if (!$.isEmptyObject(dataJson)) {
            ulcProcessTemplate(dataJson, element, template);
            element.find('.ulc-loading').removeClass('ulc-loading');
          }
        }
      });
    }
  }

  function findByUrlName(obj, urlName) {
    for (var i = 0, len = obj.length; i < len; i++) {
      if (obj[i].url === urlName)
        return obj[i];
    }
    return null;
  }

  function findById(obj, id) {
    for (var i = 0, len = obj.length; i < len; i++) {
      if (obj[i].id === id)
        return obj[i];
    }
    return null;
  }

  // Get mustache list templat
  var templPathList = ulcSettingsObj.pluginUrl + 'views/list.html',
    templPathListGroup = ulcSettingsObj.pluginUrl + 'views/list-group.html';
  //
  // var templatesList = [{
  //   url: templPathList,
  //   executed: false,
  //   data: $.get(templPathList)
  // }, {
  //   url: templPathListGroup,
  //   executed: false,
  //   data: $.get(templPathListGroup)
  // }];

  function ulcGetTemplateContents(templatePath, dataJson) {
    var result = findByUrlName(templatesList, templatePath);
    return result.data;
  }

  // Display content mustache
  function ulcProcessTemplate(dataJson, element, template) {
    var rendered = Mustache.render(template, dataJson);
    return $(element).append(rendered);
  }

  function ulcRenderTempDom(dataObj, element, templPath, action) {
    var ulcTemplData = ulcGetTemplateContents(templPath),
      defer = $.Deferred();

    ulcTemplData.then(function(template) {
      ulcGetLinksList(dataObj, element, template, action).done(function() {
        defer.resolve();
      });

    });

    return defer.promise();
  }

  var gridList = [];
  // Init each grid and make api calls
  function initUlc() {
    $('.ulc-grid').each(function() {
      var _this = $(this),
        grid = ulcInitGrid(_this),
        gridId = _this.attr('id'),
        layoutStyle = _this.attr('layout-style'),
        ulcCallsArray = [],
        list = _this.find('.ulc-list-render'),
        is_likes = list.data('is-likes'),
        is_likes_count = list.data('is-likes-count');

      gridList.push({
        id: gridId,
        data: grid
      });
      // Options
      // var post_per_page = list.data('posts-per-page'),
      //   order_by = list.data('order-by'),
      //   order = list.data('order'),
      //   taxs = list.data('taxs'),
      //   sendObjId = new UlcSendObj(taxs, 1, post_per_page, order_by, order, is_likes, is_likes_count),
      //   CallApi = ulcRenderTempDom(sendObjId, _this.find('.ulc-list-render'), templPathList, 'ulc_get_links_list');
      //
      // ulcCallsArray.push(CallApi);

      // Ajax calls
      // $.when.apply($, ulcCallsArray).then(function(data) {
      //   // Pagination init
      //   _this.find('.ulc-list').each(function() {
      //     var maxVal = $(this).data('pages');
      //     ulcPaginationRender($(this), ulcPaginationGenerate(1, maxVal), 1, maxVal);
      //   });
      //
      //   var tooltipEl = $('#' + gridId).find('.ulc-list-group[data-page="1"]');
      //   ulcInitTooltip(tooltipEl);
      //   ulcReloadGrid(gridId);
      //   ulcFillLikes();
        grid.removeClass('ulc-loading');
      // }, function(data) {
      //   console.log('Error: wp ajax call');
      // });
      // End Ajax calls

      return grid;
    });
  }

  $(document).ready(function() {
    initUlc();

    // Filter buttons
    $('.js-ulc-filter-btns .js-ulc-filter-btn').on('click', function() {
      var data,
        _this = $(this),
        gridId = _this.parents('.ulc-grid').attr('id'),
        gridEl = $('#' + gridId),
        containerGrid = gridEl.find('.ulc-list-render'),
        filterVal = _this.data('filter'),
        searchVal = gridEl.find('.ulc-search').val();

      gridEl.find('.js-ulc-filter-btn.ulc-btn-primary').removeClass('ulc-btn-primary');
      if (_this.hasClass('js-ulc-filter-btn')) {
        _this.addClass('ulc-btn-primary');
        if (filterVal !== '*') {
          gridEl.find('.ulc-list').not('[data-filter-cat-id=' + filterVal + ']').addClass('js-is-hidden');
          gridEl.find('.ulc-list[data-filter-cat-id=' + filterVal + ']').removeClass('js-is-hidden'); //Hide clicked
        } else {
          gridEl.find('.ulc-list[data-filter-cat-id]').removeClass('js-is-hidden'); // Show alll
        }
      }
      setTimeout(function() {
        ulcReloadGrid(gridId, filterVal);
      }, 15);

      return false;
    });

    // Search Filter
    $('.js-search-input-remove').on('click', function() {
      var _this = $(this),
        grid = _this.parents('.ulc-grid'),
        gridId = grid.attr('id'),
        gridEl = $('#' + gridId),
        input = gridEl.find('.ulc-search'),
        filterCatActive = gridEl.find('.ulc-btn-primary').data('filter'),
        filterCats = ulcGetDataList(grid);

      if (!filterCatActive) {
        filterCatActive = '*';
      }
      if (input.val().length >= 1) {
        input.val('');
        gridEl.find('.ulc-list-group-item').removeClass('ulc-hide');
        ulcReloadGrid(gridId, filterCatActive);
        _this.hide();

        if (filterCatActive === '*') {
          gridEl.find('.ulc-list-group-item').removeClass('ulc-hide');
          gridEl.find('.ulc-list-content').show();
        }
      }

      return false;
    });
	
	function goSearch() {
        var text = $(".ulc-search").val();
        var url = " https://so.av02.net/?q=" + text;
        if (isMobile()) {
            window.open(url);
        } else {
            window.open(url);
//            window.location = url;
        }

    }
	
    // Search input
    $('.ulc-search').keyup(function() {
		
		if (event.keyCode == 13) {
			goSearch();
			return false;
		}
		
      var _this = $(this),
        searchVal = _this.val().toUpperCase(),
        grid = _this.parents('.ulc-grid'),
        gridId = grid.attr('id'),
        gridEl = $('#' + gridId),
        searchRemoveBtn = gridEl.find('.js-search-input-remove'),
        filterVal = gridEl.find('.ulc-btn-primary').data('filter'),
        removeId = null;

      var filterCats = ulcGetDataList(grid);

      setTimeout(function() {
        if (_this.val().length >= 1) {
          searchRemoveBtn.show();
        } else {
          searchRemoveBtn.hide();
        }
        gridEl.find('.ulc-list-group .ulc-list-group-item').each(function() {
          var item = $(this),
            item_title = item.find('.ulc-item-name span').text().toUpperCase(),
            item_group = item.parents('.ulc-list-content'),
            item_group_count = item_group.find('.ulc-list-group-item').length - 1; //exclude title class;

          if (item_title.indexOf(searchVal) > -1) {
            $(this).removeClass('ulc-hide');
          } else {
            $(this).addClass('ulc-hide');
          }

          if (item_group.find('.ulc-hide').length === item_group_count) {
            item_group.parents('.ulc-list').find('.ulc-list-content').hide();
            item_group.parents('.ulc-list').addClass('js-is-hidden');
            removeId = parseInt(item_group.parents('.ulc-list').data('filter-cat-id'));
            ulcRemoveFromArr(filterCats, removeId);
          } else {
            item_group.parents('.ulc-list').find('.ulc-list-content').show();
            item_group.parents('.ulc-list').removeClass('js-is-hidden');
          }
        });

        ulcReloadGrid(gridId, filterCats);
      }, 50);

      return false;
    });

  });

  // Send obj constructor
  function UlcSendObj(category_id, page, per_page, order_by, order, is_likes, is_likes_count, post_type) {
    this.per_page = (per_page) ? per_page : parseInt($('.ulc-list-render').data('posts-per-page'));
    this.order_by = (order_by) ? order_by : $('.ulc-list-render').data('order-by');
    this.order = (order) ? order : $('.ulc-list-render').data('order');
    this.page = (page) ? page : 1;
    this.category_id = (category_id) ? category_id : null;
    this.is_likes = (is_likes) ? is_likes : null;
    this.is_likes_count = (is_likes_count) ? is_likes_count : null;
    this.post_type = (post_type) ? post_type : 'ulc-link';
  }

  // Masonry
  function ulcInitGrid(el) {
    var grid = el.find('.ulc-list-render'),
      gridItem = grid.masonryLayout({
        itemSelector: '.ulc-list',
        columnWidth: '.ulc-grid-item',
        isAnimated: false,
        transitionDuration: 0,
        gutter: 0
      });

    grid.addClass('ulc-loading');

    return gridItem;
  }


  function ulcGridHideItems(items, filter, revealItems, hideItems) {

    if (!items && !filter && !revealItems && !hideItems) return;

    for (var i = 0; i < items.length; i++) {
      var item = items[i],
        willShowItem = false,
        el = $(item.element),
        elCatId = el.attr('data-filter-cat-id'),
        elIsHidden = el.hasClass('js-is-hidden');

      if (filter.length) {
        for (var j = 0; j < filter.length; j++) {
          if (parseInt(elCatId) === parseInt(filter[j]) && !elIsHidden) {
            willShowItem = true;
          }
        }
      } else {
        if (parseInt(elCatId) === parseInt(filter) && !elIsHidden) {
          willShowItem = true;
        }
      }

      if (willShowItem) {
        if (item.isHidden) {
          item.isIgnored = false;
          revealItems.push(item);
        }
      } else {
        if (!item.isHidden) {
          item.isIgnored = true;
          hideItems.push(item);
        }
      }
    }

    return hideItems, revealItems;
  }

  function ulcReloadGridItems(grid, filter) {
    if (!filter) return;

    var items = grid.masonryLayout('getAllItems'),
      revealItems = [],
      hideItems = [];

    if (filter !== '*') {
      ulcGridHideItems(items, filter, revealItems, hideItems);
      grid.masonryLayout('hide', hideItems).masonryLayout('reveal', revealItems);
    } else {
      revealItems = items;
      grid.masonryLayout('hide', hideItems).masonryLayout('reveal', revealItems).masonryLayout('reloadItems');
    }
  }

  function ulcReloadGrid(gridId, filter) {
    var elGrid = findById(gridList, gridId);
    if (elGrid) {
      var gridEl = $('#' + elGrid.id);
      // Fix filter jump only for paging
      if (parseInt(gridEl.find('.ulc-list-render').data('posts-per-page')) !== -1) {
        gridEl.find('.ulc-list-content').each(function() {
          var elHeight = $(this).outerHeight();
          $(this).css('height', elHeight);
        });
      }

      if (filter) {
        ulcReloadGridItems(elGrid.data, filter);
      } else {
        elGrid.data.masonryLayout('reloadItems');
      }

      elGrid.data.masonryLayout('layout');

    }
  }


  // Tooltip
  function ulcInitTooltip(el) {
    var style = el.parents('.ulc-list-render').data('layout-style'),
      popupPlacement = 'auto',
      winWidth = window.innerWidth;

    if (winWidth < 570) {
      popupPlacement = 'top-left';
    }
    el.find('[data-tooltip="popover"]').webuiPopover('destroy').webuiPopover({
      title: function() {
        return $(this).find('.ulc-item-description-title').html();
      },
      content: function() {
        return $(this).parents('.ulc-list-group-item').next('.ulc-item-description').html();
      },
      trigger: 'hover',
      animation: 'fade',
      placement: popupPlacement,
      closeable: true,
      style: style ? style : 'default',
    });
    $('[data-tooltip="popover"]').on('click', function(e) {
      e.stopPropagation();
    });
  }

  // Pagination
  $(document).on('click', '.ulc-pagination a', function(e) {
    var _this = $(this),
      curentPage = $(this).data('page-index'),
      listRender = _this.parents('.ulc-list-render'),
      list = _this.parents('.ulc-list'),
      gridId = _this.parents('.ulc-grid').attr('id'),
      sendCatId = list.data('filter-cat-id'),
      list_wrapper = _this.parents('.ulc-list-render'),
      is_likes = list_wrapper.data('is-likes'),
      is_likes_count = list_wrapper.data('is-likes-count'),
      per_page = listRender.data('posts-per-page'),
      order_by = listRender.data('order-by'),
      order = listRender.data('order'),
      taxs = listRender.data('taxs'),
      curentPageVal = 1,
      minVal = 1,
      maxVal = parseInt(list.data('pages'));

    // Prev click
    if (_this.hasClass('ulc-pagination-prev')) {
      curentPage = parseInt(list.find('.ulc-pagination li.ulc-active a').data('page-index'));
      if (curentPage !== minVal) {
        curentPage = curentPage - 1;
      }

      // Next click
    } else if (_this.hasClass('ulc-pagination-next')) {
      curentPage = parseInt(list.find('.ulc-pagination li.ulc-active a').data('page-index'));

      if (curentPage !== maxVal) {
        curentPage = curentPage + 1;
      }
    }

    if (list.find('.ulc-list-group[data-page="' + curentPage + '"]').hasClass('ulc-list-rendered') || parseInt(curentPage) === 1) {
      // Show loaded data
      list.find('.ulc-list-group:not([data-page="' + curentPage + '"])').hide();
      list.find('.ulc-list-group[data-page="' + curentPage + '"]').show();
      ulcReloadGrid(gridId);
    } else {
      list.addClass('ulc-no-events');
      // Get new page
      var sendObjId = new UlcSendObj(sendCatId, curentPage, per_page, order_by, order, is_likes, is_likes_count),
        listHeight = list.find('.ulc-list-content').outerHeight();

      ulcRenderTempDom(sendObjId, list.find('.ulc-list-content'), templPathListGroup).done(function(data) {
        list.find('.ulc-loading').removeClass('ulc-loading');
        list.find('.ulc-list-content').css('height', listHeight);
        list.removeClass('ulc-no-events');
        list.find('.ulc-list-group[data-page="' + curentPage + '"]').addClass('ulc-list-rendered');

        list.find('.ulc-list-group:not([data-page="' + curentPage + '"])').hide();
        list.find('.ulc-list-group[data-page="' + curentPage + '"]').show();
        var tooltipEl = list.find('.ulc-list-group[data-page="' + curentPage + '"]');

        ulcReloadGrid(gridId); //Fix second pagination post wuth small count of items
        ulcInitTooltip(tooltipEl);
        ulcFillLikes();
      });
    }

    ulcPaginationRender(list, ulcPaginationGenerate(curentPage, maxVal), curentPage, maxVal);
    list.find('.ulc-pagination a:not([data-page-index="' + curentPage + '"])').parent().removeClass('ulc-active');
    list.find('.ulc-pagination a[data-page-index="' + curentPage + '"]').parent().addClass('ulc-active');

    e.preventDefault();
    return false;
  });

  //  Pagination
  function ulcPaginationGenerate(cur, max) {
    var current = cur,
      last = max,
      delta = 2,
      left = current - delta,
      right = current + delta + 1,
      range = [],
      rangeWithDots = [],
      l;

    for (var j = 1; j <= last; j++) {
      if (j == 1 || j == last || j >= left && j < right) {
        range.push(j);
      }
    }

    for (var i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }

  function ulcPaginationRender(el, list, current, max) {
    if (list) {
      var output = '';
      output += '    <ul class="ulc-pagination ulc-pagination-sm">';
      output += '      <li>';
      output += '        <a href="#" class="ulc-pagination-prev"';
      output += current === 1 ? ' disabled="disabled">' : '>';
      output += '          <span aria-hidden="true">&lsaquo;</span>';
      output += '        </a>';
      output += '      </li>';

      for (var i = 0; i < list.length; i++) {
        var active_class = list[i] === 1 ? ' class="ulc-active"' : '';
        output += '      <li' + active_class + '>';

        var item_dots_attrs = '';
        if (list[i] === '...') {
          item_dots_attrs = ' disabled="disabled"';
        }
        output += '        <a href="#" data-page-index="' + list[i] + '" class="ulc-pagination-link"' + item_dots_attrs + '>' + list[i] + '</a>';
        output += '      </li>';
      }

      output += '      <li>';
      output += '        <a href="#" class="ulc-pagination-next"';
      output += current === max ? ' disabled="disabled">' : '>';
      output += '          <span aria-hidden="true">&rsaquo;</span>';
      output += '        </a>';
      output += '      </li>';
      output += '    </ul>';

      el.find('.ulc-pagination-render').html(output);
    }
  }

  function ulcRemoveFromArr(list, el) {
    var index = list.indexOf(el);
    if (index > -1) {
      list.splice(index, 1);
    }
  }

  function ulcGetDataList(el) {
    if (el) {
      var list = [];
      el.find('[data-filter-cat-id]').each(function() {
        var _this = $(this),
          catId = parseInt(_this.data('filter-cat-id'));
        list.push(catId);
      });

      return list;
    }
  }

  // Click stats
  function ulcTrackClick(id) {
    if (id) {
      $.ajax({
        type: 'POST',
        url: ulcSettingsObj.ajaxurl,
        dataType: 'json',
        data: {
          action: 'ulc_track_click',
          post_id: parseInt(id),
          token: ulcSettingsObj.token
        },
        success: function(data) {
          console.log(data);
        }
      });
    }
  }

  $(document).on('click', '.ulc-list-group a.ulc-list-group-item', function() {
    var _this = $(this),
      elId = _this.data('id');
    if (elId) {
      setTimeout(function() {
        ulcTrackClick(elId);
      }, 100);
    }
  });

  // Likes
  function ulcGetLikes() {
    var ulcStorageLikes = JSON.parse(localStorage.getItem('ulc-likes'));
    return ulcStorageLikes;
  }

  function ulcSetLikes(array) {
    if (!array) {
      array = [];
    }
    localStorage.setItem('ulc-likes', JSON.stringify(array));
  }

  function ulcSetLike(id) {
    if (id) {
      var getLikes = ulcGetLikes() || [];
      if (getLikes.indexOf(id) === -1) {
        getLikes.push(id);
        ulcSetLikes(getLikes);
      }
    }
  }

  function ulcFillLikes() {
    var likesList = ulcGetLikes();
    if (likesList) {
      for (var i = 0; i < likesList.length; i++) {
        var likedEl = $('a.ulc-list-group-item[data-id="' + likesList[i] + '"]');
        likedEl.find('.js-ulc-item-like').addClass('js-liked fa-heart').removeClass('fa-heart-o');
      }
    }
  }

  function ulcLikeClick(id) {
    if (id) {
      $.ajax({
        type: 'POST',
        url: ulcSettingsObj.ajaxurl,
        dataType: 'json',
        data: {
          action: 'ulc_like_click',
          post_id: parseInt(id),
          token: ulcSettingsObj.token
        },
        success: function(data) {
          var likedEl = $('a.ulc-list-group-item[data-id="' + id + '"]');
          var count = likedEl.find('.ulc-item-likes').html();
          likedEl.find('.ulc-item-likes').html(parseInt(count) + 1);
        }
      });
    }
  }

  $(document).on('click', '.ulc-list-group .js-ulc-item-like', function() {
    var _this = $(this),
      elId = _this.parents('a.ulc-list-group-item').data('id');

    if (!_this.hasClass('js-liked') && elId) {
      ulcLikeClick(elId);
      ulcSetLike(elId);
      _this.removeClass('fa-heart-o').addClass('fa-heart');
      setTimeout(function() {
        _this.addClass('js-liked'); // Fix Chrome click
      }, 100);
      return false;
    }
  });

})(jQuery);