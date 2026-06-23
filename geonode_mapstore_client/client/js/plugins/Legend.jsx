/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { layersSelector } from '@mapstore/framework/selectors/layers';
import { mapSelector } from '@mapstore/framework/selectors/map';
import { updateNode } from '@mapstore/framework/actions/layers';
import Message from '@mapstore/framework/components/I18N/HTML';
import TOC from '@mapstore/framework/plugins/TOC/components/TOC';
import { currentLocaleLanguageSelector, currentLocaleSelector } from '@mapstore/framework/selectors/locale';
import { isLocalizedLayerStylesEnabledSelector } from '@mapstore/framework/selectors/localizedLayerStyles';
import { getScales } from '@mapstore/framework/utils/MapUtils';

function applyVersionParamToLegend(layer) {
    // we need to pass a parameter that invalidate the cache for GetLegendGraphic
    // all layer inside the dataset viewer apply a new _v_ param each time we switch page
    return { ...layer, legendParams: { ...layer?.legendParams, _v_: layer?._v_ } };
}

function Legend({
    layers,
    onUpdateNode,
    currentZoomLvl,
    scales,
    language,
    currentLocale,
    projection,
    mapSize,
    mapBbox
}) {

    const [expandLegend, setExpandLegend] = useState(false);
    const tocContainerRef = useRef(null);

    const expand = () => {
        setExpandLegend(ex => !ex);
    };

    // Apply cy-data attributes to layer items after rendering
    useEffect(() => {
        if (expandLegend && tocContainerRef.current) {
            // Find all layer title containers (MapStore TOC structure)
            const titleContainers = tocContainerRef.current.querySelectorAll('.ms-node-title-container');
            titleContainers.forEach((container) => {
                const titleText = container.querySelector('.ms-node-title');
                if (titleText) {
                    const layerName = titleText.textContent?.trim() || '';
                    // Add cy-data to the title container
                    container.setAttribute('cy-data', `ms-node-title-container-${layerName.replace(/\s+/g, '-').toLowerCase()}`);
                    // Add cy-data to the title itself
                    titleText.setAttribute('cy-data', `ms-node-title-${layerName.replace(/\s+/g, '-').toLowerCase()}`);
                }
            });
            
            // Also find all layer node headers
            const nodeHeaders = tocContainerRef.current.querySelectorAll('[id^="node-"]');
            nodeHeaders.forEach((node) => {
                const layerId = node.id.replace('node-', '');
                const titleContainer = node.querySelector('.ms-node-title-container');
                if (titleContainer) {
                    const titleText = titleContainer.textContent?.trim() || '';
                    node.setAttribute('cy-data', `gn-legend-layer-${layerId}`);
                }
            });
        }
    }, [expandLegend, layers]);

    if (!layers.length) {
        return null;
    }

    return (
        <div className="shadow gn-legend-wrapper" style={{ position: 'absolute', margin: 4, width: 'auto', zIndex: 50 }} {...{ 'cy-data': 'gn-legend-wrapper' }}>
            <div onClick={expand} className="gn-legend-head" style={{ padding: '4px 8px', fontSize: '0.75rem' }} {...{ 'cy-data': 'gn-legend-head' }}>
                <span role="button" className={`identify-icon glyphicon glyphicon-${expandLegend ? 'bottom' : 'next'}`} title="Expand layer legend" {...{ 'cy-data': 'gn-legend-toggle' }} />
                <span className="gn-legend-list-item" style={{ paddingLeft: 4 }}><Message msgId="gnviewer.legend" /></span>
            </div>
            <div style={{ display: expandLegend ? 'block' : 'none' }} {...{ 'cy-data': 'gn-legend-content' }} ref={tocContainerRef}>
                <TOC
                    map={{
                        layers: layers.map(applyVersionParamToLegend),
                        groups: [],
                        bbox: mapBbox,
                        size: mapSize,
                        projection
                    }}
                    theme="legend"
                    config={{
                        sortable: false,
                        showFullTitle: true,
                        hideOpacitySlider: false,
                        hideVisibilityButton: false,
                        expanded: true,
                        language,
                        currentLocale,
                        scales,
                        zoom: currentZoomLvl
                    }}
                    onChangeMap={(newMap) => {
                        newMap.layers.forEach(layer => {
                            onUpdateNode(layer.id, 'layers', {
                                opacity: layer.opacity,
                                visibility: layer.visibility
                            });
                        });
                    }}
                />
            </div>
        </div>
    );
}

const ConnectedLegend = connect(
    createSelector([
        layersSelector,
        mapSelector,
        currentLocaleSelector,
        currentLocaleLanguageSelector,
        isLocalizedLayerStylesEnabledSelector
    ], (layers, map, currentLocale, currentLocaleLanguage, isLocalizedLayerStylesEnabled) => ({
        layers: layers.filter(layer => layer.group !== 'background' && ['wms', 'arcgis'].includes(layer.type)),
        currentZoomLvl: map?.zoom,
        scales: getScales(
            map && map.projection || 'EPSG:3857',
            map && map.mapOptions && map.mapOptions.view && map.mapOptions.view.DPI || null
        ),
        language: isLocalizedLayerStylesEnabled ? currentLocaleLanguage : null,
        currentLocale,
        projection: map?.projection || 'EPSG:3857',
        mapSize: map?.size,
        mapBbox: map?.bbox
    })),
    {
        onUpdateNode: updateNode

    }
)(Legend);

export default createPlugin('Legend', {
    component: ConnectedLegend,
    containers: {},
    epics: {},
    reducers: {}
});
