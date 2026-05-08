import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
function CalendarStrip() {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const numbers = [16, 17, 18, 19, 20, 21, 22];

  return (
    <div className="bg-blue-200 rounded-xl p-3 mb-6">
      <div className="flex justify-between">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="text-sm text-gray-700">{day}</span>
            <div
              className={`mt-1 w-8 h-8 flex items-center justify-center rounded-full 
              ${day === "Vie" ? "bg-blue-600 text-white" : "text-gray-800"}`}
            >
              {numbers[index]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarStrip;