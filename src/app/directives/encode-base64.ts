import { Directive, ElementRef, Output } from '@angular/core';
import { output, inject } from '@angular/core';

@Directive({
  selector: 'input[type=file][encodeBase64]',
  host: {
    '(change)': 'encodeFile()'
  },
})
export class EncodeBase64Directive {
  encoded = output<string>();
  element = inject<ElementRef<HTMLInputElement>>(ElementRef);

  encodeFile() {
    const fileInput = this.element.nativeElement;
    if (!fileInput.files?.length) {
      this.encoded.emit('');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(fileInput.files[0]);
    reader.onload = () => {
      const result = reader.result as string;

      const base64 = result.split(',')[1];
      this.encoded.emit(base64);
    };
  };
}

