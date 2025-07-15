import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';
import { Checkbox } from '@/components/ui/checkbox';

export default function AnnotationSchemaBuilder({
  annotationSchema,
  hasBeenSaved,
  onAnnotationSchemaChanged
}: { annotationSchema: any, hasBeenSaved: boolean, onAnnotationSchemaChanged: (annotationSchema: any) => void }) {

  const onCreateNewSchemaField = () => {
    const annotationSchemaCloned = cloneDeep(annotationSchema);

    annotationSchemaCloned.push({ isSystem: false, fieldType: 'string', fieldKey: 'field', value: '' });
    onAnnotationSchemaChanged(annotationSchemaCloned);
  }

  const onAnnotationFieldChanged = ({ itemIndex, field, value }: { itemIndex: number, field: string, value: boolean | string | number }) => {
    const annotationSchemaCloned = cloneDeep(annotationSchema);
    if (field === 'fieldType') {
      if (value === 'string') {
        annotationSchemaCloned[itemIndex].value = '';
      } else if (value === 'number') {
        annotationSchemaCloned[itemIndex].value = 0;
      } else {
        annotationSchemaCloned[itemIndex].value = false
      }
    }
    annotationSchemaCloned[itemIndex][field] = value;
    onAnnotationSchemaChanged(annotationSchemaCloned);
  }

  return (
    <div>
      <div>

        {map(annotationSchema, (annotationField, index) => {
          return (
            <div
              key={index}
              className="grid grid-cols-3 gap-4 border-b pb-4 mb-4"
            >
              <div>
                <Label className="text-xs mb-0.5">Key</Label>
                <Input
                  disabled={annotationField.isSystem || hasBeenSaved}
                  value={annotationField.fieldKey}
                  onChange={(event) => onAnnotationFieldChanged({ itemIndex: index, field: 'fieldKey', value: event?.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs mb-0.5">Type</Label>
                <Select
                  disabled={annotationField.isSystem || hasBeenSaved}
                  value={annotationField.fieldType}
                  onValueChange={(fieldType) => onAnnotationFieldChanged({ itemIndex: index, field: 'fieldType', value: fieldType })}
                >
                  <SelectTrigger id="annotation-type" className="w-[180px]">
                    <SelectValue placeholder="Select a field type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">string</SelectItem>
                    <SelectItem value="number">number</SelectItem>
                    <SelectItem value="boolean">boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-0.5">Value</Label>
                {(annotationField.fieldType === 'boolean') && (
                  <Checkbox
                    checked={annotationField.value}
                    disabled={annotationField.isSystem || hasBeenSaved}
                    onCheckedChange={(checked) => onAnnotationFieldChanged({ itemIndex: index, field: 'value', value: checked })}
                  />
                ) || (
                    <Input
                      value={annotationField.value}
                      disabled={annotationField.isSystem || hasBeenSaved}
                      type={annotationField.fieldType === 'string' ? 'text' : 'number'}
                      onChange={(event) => onAnnotationFieldChanged({ itemIndex: index, field: 'value', value: event?.target.value })}
                    />
                  )}
              </div>
            </div>
          )
        })}
      </div>
      <div>
        <Button onClick={onCreateNewSchemaField}>Create field</Button>
      </div>
    </div>
  )
}