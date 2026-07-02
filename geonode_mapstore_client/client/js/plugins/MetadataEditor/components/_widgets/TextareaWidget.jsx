/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { lazy, Suspense } from 'react';
import DefaultTextareaWidget from '@rjsf/core/lib/components/widgets/TextareaWidget';
const RichTextEditor = lazy(() => import('./RichTextEditor'));

function TextareaWidget(props) {
    const {
        id,
        options = {},
        value,
        onChange
    } = props;
    if (options?.['geonode-ui:richTextEditor']) {
        return (
            <Suspense fallback={null}>
                <div {...{ 'cy-data': `${id}-widget` }}>
                    <RichTextEditor
                        id={id}
                        value={value}
                        onChange={onChange}
                    />
                </div>
            </Suspense>
        );
    }
    return (<DefaultTextareaWidget {...props} {...{ 'cy-data': `${id}-widget` }}/>);
}

export default TextareaWidget;
