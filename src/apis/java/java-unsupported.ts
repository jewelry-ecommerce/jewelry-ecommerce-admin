import { BackendHttpError } from '../backend-request';
import { recordJavaCapabilityGap } from './java-capability-gaps';
export function unsupportedJavaFields(endpoint: string, fields: readonly string[]): never {
  recordJavaCapabilityGap('CONTRACT', endpoint + ' [' + fields.join(', ') + ']');
  throw new BackendHttpError('JAVA_CAPABILITY_NOT_SUPPORTED',
    'Java chưa hỗ trợ đầy đủ các trường: ' + fields.join(', ') + '. Lựa chọn chưa được áp dụng.', 501);
}
