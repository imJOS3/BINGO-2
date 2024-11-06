import { useState } from "preact/hooks";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex animate-rotate-y animate-infinite flex-col items-center p-10">
     <button className="animate-wiggle">
  Hej, look at me!
</button>

<button className="animate-jump-in animate-delay-300 animate-once">
  Wait a bit, then jump right in.
</button>
    </div>
  );
}
