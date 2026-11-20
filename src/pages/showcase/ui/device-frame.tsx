import Image from "next/image";

type DeviceFrameProps = {
  src: string;
  alt: string;
  title: string;
  caption: string;
};

export function DeviceFrame({ src, alt, title, caption }: DeviceFrameProps) {
  return (
    <figure className="showcase-device">
      <div className="showcase-device-frame">
        <div className="showcase-device-chrome" aria-hidden="true">
          <span className="showcase-device-dots"><i /><i /><i /></span>
          <span>Panel EventPro</span>
        </div>
        <Image src={src} alt={alt} width={1600} height={1000} sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 80px), (max-width: 1400px) 65vw, 1100px" loading="eager" className="showcase-device-image" />
      </div>
      <figcaption><strong>{title}</strong><span>{caption}</span></figcaption>
    </figure>
  );
}
