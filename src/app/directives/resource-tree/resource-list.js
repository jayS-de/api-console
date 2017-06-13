(function () {
  'use strict';

  function listItemElement($scope, $compile, resource, showResource, resourceId) {
    var id = resourceId(resource);
    var element = angular.element('<li class="raml-console-resource-list-item"></li>');
    element.attr('id', id);
    updateListItemElement(element, $scope, $compile, resource, $scope.currentId, showResource, resourceId);

    // update on 'methodClick' if must
    $scope.$on('methodClick', function(event, currentId, oldId) {
      if (id === currentId || id === oldId) {
        updateListItemElement(element, $scope, $compile, resource, currentId, showResource, resourceId);
      }
    });

    return element;
  }

  function updateListItemElement(element, $scope, $compile, resource, currentId, showResource, resourceId) {
    element.empty();

    element.append(consoleResourceElement($scope, $compile, resource, currentId, showResource, resourceId));

    if (resourceId(resource) === currentId) {
      var resourcePanel = angular.element('<resource-panel></resource-panel>');
      element.append(resourcePanel);
      $compile(resourcePanel)($scope);
    }
  }

  function consoleResourceElement($scope, $compile, resource, currentId,  showResource, resourceId) {
    var element = angular.element('<div class="raml-console-resource raml-console-clearfix"></div>');
    if (resourceId(resource) === currentId) { element.addClass('raml-console-is-active'); }
    element.append(resourcePathContainerElement($scope, $compile, resource, currentId, showResource, resourceId));

    return element;
  }

  function resourcePathContainerElement($scope, $compile, resource, currentId, showResource, resourceId) {
    var element = angular.element('<div class="raml-console-resource-path-container"></div>');
    if (resource.description) {element.addClass('raml-console-resource-with-description');}

    element.append(resourceHeadingElement(resource, currentId));
    element.append(resourceTypeElement(resource));
    element.append(resourceHeadingFlagElement($scope, resource));
    element.append(resourceLevelDescriptionElement(resource));
    element.append(methodListElement($scope, resource, currentId, showResource, resourceId));
    element.append(closeMethodButton($scope, resource, currentId, showResource, resourceId));

    return element;
  }

  function resourceHeadingFlagElement($scope, resource) {
    var methodInfo = $scope.methodInfo;
    if (methodInfo && methodInfo.is) {
      var element1 = angular.element('<span class="raml-console-flag raml-console-resource-heading-flag raml-console-resource-trait" ></span>');
      element1.append('<b>Traits:</b>');
      element1.append($scope.readTraits(methodInfo.is));
      return element1;
    } else if (resource.traits) {
      var element2 = angular.element('<span class="raml-console-flag raml-console-resource-heading-flag" ></span>');
      element2.append('<b>Traits:</b>');
      element2.append($scope.readTraits(resource.traits));
      return element2;
    }

    return '';
  }

  function resourceLevelDescriptionElement(resource) {
    var element = angular.element('<span class="raml-console-resource-level-description raml-console-marked-content"></span>');
    element.attr('markdown', resource.description);
    return element;
  }

  function resourceHeadingElement(resource) {
    var element = angular.element('<h3 class="raml-console-resource-heading" style="cursor: default;"></h3>');
    var segments = resource.pathSegments;
    segments
      .forEach(function (segment, index) {
        var span = angular.element('<span>' + segment.toString() + '</span>');
        element.append(span);
        if (index === segments.length - 1) {
          span.addClass('raml-console-resource-path-active');
        }
      });

    return element;
  }

  function resourceTypeElement(resource) {
    if (resource.resourceType) {
      var element = angular.element('<span class="raml-console-flag raml-console-resource-heading-flag"></span>');
      element.append('<b>Type: </b>');
      if (typeof resource.resourceType === 'string' ) {
        element.append(resource.resourceType);
      } else {
        element.append(Object.keys(resource.resourceType)[0]);
      }

      return element;
    }

    return '';
  }

  var methodElement = function ($scope, resource, currentId, method, index, showResource, resourceId) {
    var element = angular.element('<div class="raml-console-tab"></div>');
    var methodSpan = angular.element('<span class="raml-console-tab-label"></span>');
    methodSpan.addClass('raml-console-tab-' + method.method);
    methodSpan.append(method.method.toLocaleUpperCase());
    element.append(methodSpan);
    element.on('click', function (event) {
      showResource($scope, resource, event, index);
      $scope.$apply();
    });

    if (currentId === resourceId(resource) && $scope.currentMethod === method.method) {
      element.addClass('raml-console-is-active');
    }

    return element;
  };

  function methodListElement($scope, resource, currentId, showResource, resourceId) {
    var element = angular.element('<div class="raml-console-tab-list"></div>');
    resource.methods && resource.methods
      .forEach(function (method, index) {
        element.append(methodElement($scope, resource, currentId, method, index, showResource, resourceId));
      });

    return element;
  }

  function closeMethodButton($scope, resource, currentId, showResource, resourceId) {
    if (resourceId(resource) === currentId) {
      var closeButton = angular.element('<button class="raml-console-resource-close-btn"> Close </button>');
      closeButton.on('click', function (event) {
        showResource($scope, resource, event, null);
        $scope.$apply();
      });

      return closeButton;
    }

    return '';
  }

  RAML.Directives.resourceList = function resourceList($compile, showResource, resourceId) {
    return {
      restrict: 'E',
      templateUrl: 'directives/resource-tree/resource-list.tpl.html',
      replace: true,
      link: function ($scope, element) {
        var resources = $scope.resourceGroup;
        resources
          .forEach(function (resource, index) {
            if (index === 0) { return; }
            element.append(listItemElement($scope, $compile, resource, showResource, resourceId));
          });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('resourceList', ['$compile', 'showResource', 'resourceId', RAML.Directives.resourceList]);
})();
