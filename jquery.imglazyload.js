(function($){
  'use strict';

  var ImageLoader = function() {};

  ImageLoader.toArray = function(elements) {
      var tempArray = [];
      for (var i = 0; i < elements.length; i++) {
          tempArray.push(elements.eq(i));
      }
      return tempArray;
  }

  ImageLoader.windowHeight = $(window).height();

  ImageLoader.loadImage = function(element, src, failedSrc, callback) {
    var img = $('<img />').attr('src',src);
    img.load(function(){
      element.attr('src',src);
      if(callback)
        callback(false);
    });
    img.error(function(){
      element.attr('src',failedSrc);
      if(callback)
        callback(true);
    });
  }

  ImageLoader.isImageLocatedInVisibleArea = function(element) {
    if (element) {
        var top = element.offset().top;
        var scrolltop = $(window).scrollTop();
        if (top > scrolltop && top < scrolltop + ImageLoader.windowHeight) {
            return true;
        }
    }
    return false;
  }


/**
** show images on load functionality
**/

  ImageLoader.prototype.showOnLoad = function() {
    this.removeClass('hide').show();
  }

  /**
  * show images on pipeline one after another
  **/

  ImageLoader.prototype.pipeline = function(options) {
    var options = $.extend({},ImageLoader.options,options);
    var css = ImageLoader.options.css
    css['background-image'] = 'url('+options.loaderImg+')';
    this.css(css);
    var srcs = this.map(function(){
      return $(this).attr('src');
    });
    this.attr('src','');
    var pipelineImages = ImageLoader.toArray(this);
    var noOfLoadedImages = 0;
    var startLoading = function() {
      var img = pipelineImages[noOfLoadedImages];
      ImageLoader.loadImage(img,srcs[noOfLoadedImages], options.errorImg,function(hasError){
        if(hasError) {
          if(options.error && typeof options.error == 'function') {
            options.error(img,srcs[noOfLoadedImages],noOfLoadedImages);
          }
        } else {
          if(options.loaded && typeof options.loaded == 'function') {
            options.loaded(img,noOfLoadedImages);
          }
        }
        if(noOfLoadedImages < pipelineImages.length - 1) {
            noOfLoadedImages++;
            startLoading();
        }
      });
    }
    startLoading();
    return this;
  }

  ImageLoader.prototype.onscroll = function(options) {
    var options = $.extend({},ImageLoader.options,options);
    var css = ImageLoader.options.css
    css['background-image'] = 'url('+options.loaderImg+')';
    this.css(css);
    var srcs = this.map(function(){
      return $(this).attr('src');
    });
    this.attr('src','');
    var i;
    var onscrollImageArray = ImageLoader.toArray(this);
      // if not pipeline on scroll
    var loadImage = function() {
      //on scroll loading array
      if (onscrollImageArray.length > 0) {
          for (i = 0; i < onscrollImageArray.length; i++) {
              if (ImageLoader.isImageLocatedInVisibleArea(onscrollImageArray[i]) == true) {
                  var img = onscrollImageArray[i],src = srcs[i];
                  ImageLoader.loadImage(img,src, options.errorImg,function(hasError){
                    if(hasError) {
                      if(options.error && typeof options.error == 'function') {
                        options.error(img,src,i);
                      }
                    } else {
                      if(options.loaded && typeof options.loaded == 'function') {
                        options.loaded(img,onscrollImageArray.indexOf(img));
                      }
                    }
                  });
                }
            }
        }
    }
    //on window resize we should invoke the event
    $(window).resize(function () {
        ImageLoader.windowHeight = $(window).height();
        setTimeout(function(){
            loadImage();
        },1500);
    });

    //on window resize we should invoke the event
    $(window).scroll(function () {
      setTimeout(function(){
          loadImage();
      },1500);
    });
    loadImage();

    return this;
  }


  ImageLoader.prototype.onscrollSequentially = function(options) {
    var options = $.extend({},ImageLoader.options,options);
    var css = ImageLoader.options.css
    css['background-image'] = 'url('+options.loaderImg+')';
    this.css(css);
    var srcs = this.map(function(){
      return $(this).attr('src');
    });
    this.attr('src','');

    var onscrollPipelineArray = ImageLoader.toArray(this);
    var isOnScrollPipelineStackRunning = false;
    var loadImage = function() {
      if (onscrollPipelineArray.length > 0) {
        console.log(isOnScrollPipelineStackRunning);
          if (isOnScrollPipelineStackRunning == false) {
              startOnScrollPipelineLoading();
          }
      }
    }

    var startOnScrollPipelineLoading = function() {
      var found = false;
      for (var i = 0; i < onscrollPipelineArray.length; i++) {
          if (ImageLoader.isImageLocatedInVisibleArea(onscrollPipelineArray[i]) == true) {
              found = true;
              var img = onscrollPipelineArray[i],src = srcs[i];
              ImageLoader.loadImage(img,src,options.failedSrc,function(hasError){
                if(hasError) {
                  if(options.error && typeof options.error == 'function') {
                    options.error(img,src,i);
                  }
                } else {
                  if(options.loaded && typeof options.loaded == 'function') {
                    options.loaded(img,onscrollPipelineArray.indexOf(img));
                  }
                }
                //startOnScrollPipelineLoading();
              });
          }
      }
      isOnScrollPipelineStackRunning = found;
    }


    $(window).resize(function () {
        ImageLoader.windowHeight = $(window).height();
        setTimeout(function(){
            loadImage();
        },1500);
    });

    //on window resize we should invoke the event
    $(window).scroll(function () {
      setTimeout(function(){
          loadImage();
      },1500);
    });
    loadImage();
  }

  /**
  * define all jquery fn
  */


  var defaults = {
      "error": null,
      "loaded": null,
      "loaderImg": "loader.gif",
      "errorImg": "no-image.jpg",
      css:{
        'background-image':'url(loader.gif)',
        'background-color': '#f8f8f8',
        'background-repeat':'no-repeat',
        'background-position':'50%'
      }
  }

  ImageLoader.options = defaults;

  var loader = new ImageLoader;

  $.fn.showOnLoad = loader.showOnLoad;

  $.fn.onscrollImgLoading = loader.onscroll;

  $.fn.loadSequentially = loader.pipeline;

  //$.fn.onscrollSequentially = loader.onscrollSequentially;

  //$(function(){
    // manually show images on load if showOnLoad class is given
    // $('.showOnLoad').showOnLoad();
    // $('.loadSequentially').loadSequentially();
  //});

})(jQuery);
