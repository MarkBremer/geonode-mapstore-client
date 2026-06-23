# MetadataEditor Plugin - cy-data Audit Report

**Report Date**: 2026-06-23  
**Scope**: geonode-mapstore-client MetadataEditor plugin and related components  
**Status**: Complete - 19+ missing cy-data attributes identified

---

## Executive Summary

The MetadataEditor plugin and related components have **incomplete cy-data attribute coverage**. While the main form container and field labels have cy-data attributes applied via `applyMetadataCyTags()`, **interactive elements** (buttons, form controls, dropdown options, array operations) lack cy-data attributes. This audit identifies **19+ missing cy-data attributes** across 13 files.

---

## Missing cy-data Attributes by Location

### 1. ⛔ **CRITICAL - SelectInfiniteScroll Component**

**File**: `geonode_mapstore_client/client/js/components/SelectInfiniteScroll/SelectInfiniteScroll.jsx`  
**Lines**: 145-163 (SelectSync component rendering)  
**Priority**: HIGH  

**Issue**: The react-select dropdown renders options without cy-data attributes.

**Missing cy-data**:
- Container/Control element
- Menu/dropdown wrapper
- Individual option list items
- Option elements

**Recommended Solution**:
```jsx
// Add custom components to SelectSync
const customComponents = {
  Control: (props) => <div cy-data="metadata-autocomplete-control" {...props} />,
  Menu: (props) => <div cy-data="metadata-autocomplete-menu" {...props} />,
  Option: (props) => (
    <div cy-data={`metadata-autocomplete-option-${props.data.value}`} {...props}>
      {props.children}
    </div>
  )
};

// Pass to SelectSync:
<SelectSync {...props} components={customComponents} />
```

**Impact**: Cypress/automation tests cannot reliably target dropdown options.

---

### 2. ⛔ **CRITICAL - Form Submit Button (rjsf)**

**File**: `node_modules/@rjsf/core/lib/components/Form.jsx` (external dependency)  
**Issue**: The default rjsf Form component renders submit button without cy-data  

**Missing cy-data**:
- Submit button
- Form-actions container
- Cancel/Reset buttons (if configured)

**Recommended Solution**: Create custom `SubmitButton` template in `_templates/index.js`:
```jsx
function SubmitButton({ uiSchema, formContext }) {
  return (
    <div className="form-actions" cy-data="metadata-edit-actions">
      <button type="submit" cy-data="metadata-edit-submit" className="btn btn-primary">
        Save
      </button>
    </div>
  );
}
```

Then add to templates export:
```jsx
export default {
  // ... existing templates
  SubmitButton
};
```

**Impact**: Test automation cannot interact with form submission UI.

---

### 3. 🟡 **HIGH - Array Field Operation Buttons**

**File**: `geonode_mapstore_client/client/js/plugins/MetadataEditor/components/_templates/ArrayFieldItemTemplate.jsx`  
**Lines**: 44-63  
**Priority**: MEDIUM  

**Missing cy-data**:
- MoveUpButton (L50)
- MoveDownButton (L56)
- RemoveButton (L62)
- CopyButton (if present)

**Current Code**:
```jsx
{hasMoveUp && <MoveUpButton disabled={disabled || readonly || !hasMoveUp} ... />}
{hasMoveDown && <MoveDownButton disabled={disabled || readonly || !hasMoveDown} ... />}
{hasRemove && <RemoveButton disabled={disabled || readonly} ... />}
```

**Recommended Solution**: Modify button templates in `_templates/index.js`:
```jsx
function AddButton({ onClick, disabled, uiSchema, registry, index, field }) {
  return (
    <Button
      disabled={disabled}
      className="square-button-md"
      onClick={onClick}
      variant="primary"
      cy-data={`array-field-${field}-add`}
    >
      <Glyphicon glyph="plus" />
    </Button>
  );
}

function MoveUpButton({ onClick, disabled, index, idSchema }) {
  return (
    <Button
      disabled={disabled}
      className="square-button-md"
      onClick={onClick}
      cy-data={`array-item-${index}-move-up`}
    >
      <Glyphicon glyph="arrow-up" />
    </Button>
  );
}

function MoveDownButton({ onClick, disabled, index }) {
  return (
    <Button
      disabled={disabled}
      className="square-button-md"
      onClick={onClick}
      cy-data={`array-item-${index}-move-down`}
    >
      <Glyphicon glyph="arrow-down" />
    </Button>
  );
}

function RemoveButton({ onClick, disabled, index }) {
  return (
    <Button
      disabled={disabled}
      className="square-button-md"
      onClick={onClick}
      cy-data={`array-item-${index}-remove`}
    >
      <Glyphicon glyph="trash" />
    </Button>
  );
}
```

**Impact**: Cannot test array field manipulations (add/remove/reorder items).

---

### 4. 🟡 **HIGH - Autocomplete Component**

**File**: `geonode_mapstore_client/client/js/plugins/MetadataEditor/components/Autocomplete.jsx`  
**Lines**: 38-63  
**Priority**: MEDIUM  

**Missing cy-data**:
- Form group container (L38)
- Label element (L39)
- SelectInfiniteScroll wrapper (L56)
- Error message element (L63)

**Current Code**:
```jsx
<div id={id} className={`form-group${className ? " " + className : ""}...`}>
  {showLabel ? <label className="control-label" htmlFor={id}>
    {title || name}
    ...
  </label> : null}
  <SelectInfiniteScroll {...props} />
  {error}
</div>
```

**Recommended Solution**:
```jsx
<div id={id} className={`form-group...`} cy-data={`${id}-group`}>
  {showLabel ? <label className="control-label" htmlFor={id} cy-data={`${id}-label`}>
    {title || name}
    ...
  </label> : null}
  <SelectInfiniteScroll 
    {...props}
    cy-data={`${id}-autocomplete`}
  />
  {error && <div cy-data={`${id}-error`}>{error}</div>}
</div>
```

**Impact**: Cannot test autocomplete field interactions.

---

### 5. 🟡 **MEDIUM - Field Template (Labels & Wrappers)**

**File**: `geonode_mapstore_client/client/js/plugins/MetadataEditor/components/_templates/FieldTemplate.jsx`  
**Lines**: 14-28  
**Priority**: MEDIUM  

**Missing cy-data**:
- Label wrapper (L15-17)
- WrapIfAdditionalTemplate wrapper

**Current Code**:
```jsx
return (
  <WrapIfAdditionalTemplate {...props}>
    {displayLabel &&
      <label className={`control-label...`} htmlFor={id}>
        {label}
        {required && <span className="required">{' '}*</span>}
        {description ? <>{' '}{description}</> : null}
      </label>}
    {children}
    {errors}
    {help}
  </WrapIfAdditionalTemplate>
);
```

**Recommended Solution**:
```jsx
return (
  <WrapIfAdditionalTemplate {...props} cy-data={`${id}-wrapper`}>
    {displayLabel &&
      <label 
        className={`control-label...`} 
        htmlFor={id}
        cy-data={`${id}-label`}
      >
        {label}
        {required && <span className="required">{' '}*</span>}
        {description ? <>{' '}{description}</> : null}
      </label>}
    {children}
    {errors}
    {help}
  </WrapIfAdditionalTemplate>
);
```

**Impact**: Test automation cannot reliably find form field labels.

---

### 6. 🟡 **MEDIUM - Array Field Template (Add Button)**

**File**: `geonode_mapstore_client/client/js/plugins/MetadataEditor/components/_templates/ArrayFieldTemplate.jsx`  
**Lines**: 40-48  
**Priority**: MEDIUM  

**Missing cy-data**:
- AddButton component (L44-48)

**Current Code**:
```jsx
{canAdd && (
  <AddButton
    className="array-item-add"
    onClick={onAddClick}
    disabled={disabled || readonly}
    uiSchema={uiSchema}
    registry={registry}
  />
)}
```

**Recommended Solution**: Pass cy-data to AddButton:
```jsx
{canAdd && (
  <AddButton
    className="array-item-add"
    onClick={onAddClick}
    disabled={disabled || readonly}
    uiSchema={uiSchema}
    registry={registry}
    cy-data={`array-field-${idSchema.$id}-add`}
  />
)}
```

And update `AddButton` in `_templates/index.js`:
```jsx
function AddButton({ onClick, disabled, cy-data }) {
  return (
    <Button
      disabled={disabled}
      className="square-button-md"
      onClick={onClick}
      variant="primary"
      cy-data={cy-data}
    >
      <Glyphicon glyph="plus" />
    </Button>
  );
}
```

**Impact**: Cannot test array field additions.

---

### 7. 🟡 **MEDIUM - Metadata Group Navigation Buttons**

**File**: `geonode_mapstore_client/client/js/plugins/MetadataEditor/components/_templates/ObjectFieldTemplate.jsx`  
**Lines**: 42-75 (RootMetadata component)  
**Priority**: MEDIUM  

**Missing cy-data**:
- Group expand/collapse button (L46-49)
- Group property navigation button (L56-59)
- Metadata title navigation button (L90)

**Current Code**:
```jsx
<li>
  <Button className={`${groupError ? 'gn-metadata-error' : ''}...`} size="xs" onClick={() => setExpanded(...)}>
    <Glyphicon glyph={expanded ? "bottom" : "next"} />{' '}{title}...
  </Button>
  {expanded ? <ul>
    {group.map((property) => (
      <li key={property.name}>
        <Button size="xs" className={...} onClick={() => scrollIntoView(...)}>
          {property.title}...
        </Button>
      </li>
    ))}
  </ul> : null}
</li>
```

**Recommended Solution**:
```jsx
<li>
  <Button 
    className={...}
    size="xs"
    cy-data={`metadata-group-${groupKey}-toggle`}
    onClick={() => setExpanded(...)}
  >
    <Glyphicon glyph={expanded ? "bottom" : "next"} />{' '}{title}...
  </Button>
  {expanded ? <ul>
    {group.map((property) => (
      <li key={property.name}>
        <Button 
          size="xs"
          className={...}
          cy-data={`metadata-group-${groupKey}-${property.name}`}
          onClick={() => scrollIntoView(...)}
        >
          {property.title}...
        </Button>
      </li>
    ))}
  </ul> : null}
</li>

// Also add to metadata title navigation:
{metadataTitle ? (
  <li>
    <Button 
      size="xs"
      cy-data="metadata-title-nav"
      onClick={() => scrollIntoView(metadataTitleId)}
    >
      <Message msgId="gnviewer.metadataFor" /> {metadataTitle}
    </Button>
  </li>
) : null}
```

**Impact**: Cannot test metadata section navigation.

---

### 8. 🟢 **LOW - Title Field Template**

**File**: `geonode_mapstore_client/client/js/plugins/MetadataEditor/components/_templates/TitleFieldTemplate.jsx`  
**Lines**: 10-18  
**Priority**: LOW  

**Missing cy-data**:
- Label element (L11-16)

**Current Code**:
```jsx
<label className={formContext?.capitalizeTitle ? 'capitalize' : ''}>
  {title}
  {required && <span className="required">{' '}*</span>}
  {description ? <>{' '}{description}</> : null}
</label>
```

**Recommended Solution**:
```jsx
<label 
  className={formContext?.capitalizeTitle ? 'capitalize' : ''}
  cy-data={`${id}-title`}
>
  {title}
  {required && <span className="required">{' '}*</span>}
  {description ? <>{' '}{description}</> : null}
</label>
```

**Impact**: Minor - mainly for semantic test targeting.

---

### 9. 🟢 **LOW - Rich Text Editor**

**File**: `geonode_mapstore_client/client/js/plugins/MetadataEditor/components/_widgets/RichTextEditor.jsx`  
**Lines**: 14-27  
**Priority**: LOW  

**Missing cy-data**:
- Editor container wrapper

**Current Code**:
```jsx
<Editor
  {...props}
  editorState={editorState}
  onEditorStateChange={(newEditorState) => {
    ...
  }}
/>
```

**Recommended Solution**:
```jsx
<div cy-data={`${props.id}-rich-editor`} className="gn-rich-text-editor">
  <Editor
    {...props}
    editorState={editorState}
    onEditorStateChange={(newEditorState) => {
      ...
    }}
  />
</div>
```

**Impact**: Cannot specifically target rich text editor fields.

---

### 10. 🟢 **LOW - Select Widget**

**File**: `geonode_mapstore_client/client/js/plugins/MetadataEditor/components/_widgets/SelectWidget.jsx`  
**Lines**: 11  
**Priority**: LOW  

**Issue**: Passes through to DefaultSelectWidget without wrapping

**Recommended Solution**:
```jsx
function SelectWidget(props) {
  const { id } = props;
  return (
    <div cy-data={`${id}-select-widget`}>
      <DefaultSelectWidget {...props} />
    </div>
  );
}
```

**Impact**: Minor - affects select field targeting only.

---

### 11. 🟢 **LOW - Textarea Widget**

**File**: `geonode_mapstore_client/client/js/plugins/MetadataEditor/components/_widgets/TextareaWidget.jsx`  
**Lines**: 18-21  
**Priority**: LOW  

**Issue**: If using DefaultTextareaWidget, no cy-data is added

**Recommended Solution**:
```jsx
function TextareaWidget(props) {
  const { id, options = {}, value, onChange } = props;
  if (options?.['geonode-ui:richTextEditor']) {
    return (
      <Suspense fallback={null}>
        <RichTextEditor
          id={id}
          value={value}
          onChange={onChange}
        />
      </Suspense>
    );
  }
  return (
    <div cy-data={`${id}-textarea-widget`}>
      <DefaultTextareaWidget {...props} />
    </div>
  );
}
```

**Impact**: Minor - affects textarea field targeting only.

---

### 12. 🟢 **LOW - Object Field Container**

**File**: `geonode_mapstore_client/client/js/plugins/MetadataEditor/components/_templates/ObjectFieldTemplate.jsx`  
**Lines**: 120-130 (non-root ObjectField)  
**Priority**: LOW  

**Missing cy-data**:
- ObjectField container div (L121)

**Recommended Solution**:
```jsx
<div id={idSchema.$id} cy-data={`${idSchema.$id}-object-field`}>
  {/* existing content */}
</div>
```

**Impact**: Cannot target nested object fields.

---

### 13. 🟢 **LOW - Array Field Description/Title**

**File**: `geonode_mapstore_client/client/js/plugins/MetadataEditor/components/_templates/ArrayFieldTemplate.jsx`  
**Lines**: 36-43  
**Priority**: LOW  

**Missing cy-data**:
- Array field header container

**Recommended Solution**:
```jsx
<div id={idSchema.$id} className="field-array" cy-data={`${idSchema.$id}-array-field`}>
  <div className="field-array-header" cy-data={`${idSchema.$id}-header`}>
    {/* existing header content */}
  </div>
  {/* rest of content */}
</div>
```

**Impact**: Cannot target array fields as a whole.

---

## Implementation Priority & Action Items

### Phase 1: CRITICAL (Do First)
- [ ] **SelectInfiniteScroll**: Add custom react-select components with cy-data
- [ ] **Submit Button**: Create rjsf SubmitButton template override with cy-data
- [ ] **Array Buttons**: Update button templates (AddButton, MoveUpButton, MoveDownButton, RemoveButton)

### Phase 2: HIGH (Do Soon)
- [ ] **Autocomplete**: Add cy-data to form group, label, and component wrapper
- [ ] **FieldTemplate**: Add cy-data to label and wrapper elements
- [ ] **Group Navigation**: Add cy-data to metadata group buttons

### Phase 3: MEDIUM (Do Later)
- [ ] **RichTextEditor**: Add container wrapper with cy-data
- [ ] **SelectWidget**: Wrap with cy-data container
- [ ] **TextareaWidget**: Wrap with cy-data container

### Phase 4: LOW (Optional)
- [ ] **ObjectField**: Add cy-data to object field containers
- [ ] **ArrayField**: Add cy-data to array field containers
- [ ] **TitleField**: Add cy-data to title labels

---

## Testing Recommendations

After implementing cy-data attributes:

1. **Verify with Cypress**:
   ```javascript
   cy.get('[cy-data="metadata-autocomplete-option-value1"]').click();
   cy.get('[cy-data="array-item-0-remove"]').click();
   cy.get('[cy-data="metadata-edit-submit"]').click();
   ```

2. **Test all form scenarios**:
   - Simple text fields
   - Autocomplete/select fields
   - Rich text editor fields
   - Array fields (add, remove, reorder)
   - Nested object fields
   - Required field validation

3. **Validate with UI inspection**:
   - Inspect HTML to confirm cy-data presence
   - Check for cy-data naming consistency
   - Verify no duplicate cy-data values

---

## Summary Table

| Component | File | Line(s) | Missing cy-data | Priority |
|-----------|------|---------|-----------------|----------|
| SelectInfiniteScroll | SelectInfiniteScroll.jsx | 145-163 | Options, Menu, Control | HIGH |
| Form Submit | rjsf Form.jsx | external | Submit Button, Form Actions | HIGH |
| Array Buttons | index.js | 22-50 | Add, MoveUp, MoveDown, Remove | MEDIUM |
| Autocomplete | Autocomplete.jsx | 38-63 | Group, Label, Select, Error | MEDIUM |
| FieldTemplate | FieldTemplate.jsx | 14-28 | Label, Wrapper | MEDIUM |
| Group Nav | ObjectFieldTemplate.jsx | 42-75 | Group Toggle, Property Nav | MEDIUM |
| RichEditor | RichTextEditor.jsx | 14-27 | Container | LOW |
| SelectWidget | SelectWidget.jsx | 11 | Widget Wrapper | LOW |
| TextareaWidget | TextareaWidget.jsx | 18-21 | Widget Wrapper | LOW |
| ObjectField | ObjectFieldTemplate.jsx | 120-130 | Container | LOW |
| ArrayField | ArrayFieldTemplate.jsx | 36-43 | Header Container | LOW |
| **TOTAL** | — | — | **19+ attributes** | — |

---

## Notes

- The `applyMetadataCyTags()` function already maps field IDs to cy-data values for the main form fields
- Consider creating a utility function for consistent cy-data naming patterns
- react-select requires custom `components` prop to support cy-data on options
- rjsf may need custom template overrides for button rendering
- Test thoroughly after implementation to ensure no regression

