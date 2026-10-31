import { BackendHttpError } from '../backend-request';
import { recordJavaCapabilityGap } from './java-capability-gaps';
export function unsupportedJavaFields(endpoint: string, fields: readonly string[]): never {
  recordJavaCapabilityGap('CONTRACT', endpoint + ' [' + fields.join(', ') + ']');
  throw new BackendHttpError('JAVA_CAPABILITY_NOT_SUPPORTED',
    'Một số lựa chọn chưa được hỗ trợ. Vui lòng điều chỉnh và thử lại.', 501);
}
