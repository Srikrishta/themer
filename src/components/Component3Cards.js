const imgAddAnImageOfShoppingForAutumn = "http://localhost:3845/assets/1266af881a7ac302ff4354e6e0ba4679fe254e8e.png";
const img = "http://localhost:3845/assets/2fdc952022798f520df8d037b66e1f103b6d7faa.png";
const img1 = "http://localhost:3845/assets/8d7d40ef4f429a13e10999470feaad2d251c67ed.png";
const imgAutumnMeal = "http://localhost:3845/assets/67867be324b149fdbc2f5cc31419dd992f7ae245.png";
const imgAddAnAutumnMovie = "http://localhost:3845/assets/8ea70d2052f6ce510170e999f000793ea6f8a1cb.png";
const img2 = "http://localhost:3845/assets/1bd3170f3986d13a6502916089cd682ffee55e02.svg";

export default function Component3Cards({ themeColor = '#1E1E1E' }) {
  return (
    <div
      className="flex flex-row gap-8 items-center justify-center mx-auto"
      style={{ width: '1302px' }}
      data-name="3-cards"
      id="node-82_36633"
    >
      <div
        className="bg-black h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
        style={{ width: '416px', background: themeColor }}
        data-name="add an image of shopping for autumn"
        id="node-82_35814"
      >
        <p className="block text-center text-white font-bold" style={{ fontSize: '28px', lineHeight: '36px', margin: 0 }}>
          Shop for autumn weather
        </p>
      </div>
      <div
        className="bg-black h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
        style={{ width: '416px', background: themeColor }}
        data-name="autumn meal"
        id="node-82_35815"
      >
        <p className="block text-center text-white font-bold" style={{ fontSize: '28px', lineHeight: '36px', margin: 0 }}>
          Enjoy delicacies in Autumn
        </p>
      </div>
      <div
        className="bg-black h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
        style={{ width: '416px', background: themeColor }}
        data-name="add an autumn movie"
        id="node-82_35816"
      >
        <p className="block text-center text-white font-bold" style={{ fontSize: '28px', lineHeight: '36px', margin: 0 }}>
          {`Watch Movies `}<br />of the season
        </p>
      </div>
    </div>
  );
} 