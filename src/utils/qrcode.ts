import QRCode from 'qrcode';

export const generateQRCode = async (tableNumber: number): Promise<string> => {
  const qrContent = `${process.env.CLIENT_URL || 'http://localhost:3000'}/menu?table=${tableNumber}`;
  
  try {
    const qrCode = await (QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    }) as any) as string;
    return qrCode;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

export const generateQRCodePNG = async (tableNumber: number): Promise<Buffer> => {
  const qrContent = `${process.env.CLIENT_URL || 'http://localhost:3000'}/menu?table=${tableNumber}`;
  
  try {
    const qrCode = await (QRCode.toBuffer(qrContent, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    }) as any) as Buffer;
    return qrCode;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};
