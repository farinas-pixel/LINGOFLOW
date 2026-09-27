/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function cn(...classes: Array<string | boolean | undefined | null>): string {
  return classes.filter(Boolean).join(' ');
}
