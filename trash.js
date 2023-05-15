
//select for choose time slot

<div className="sm:col-span-3">
  <label
    htmlFor="last-name"
    className="block text-sm font-medium leading-6 text-gray-900 mt-2 mb-2"
  >
    Timing
  </label>
  <select
    name="timing"
    value={values.timing}
    onChange={handleChange}
    onBlur={handleBlur}
    className="select w-full max-w-xs"
  >
    <option disabled selected>
      Choose Time Slotes
    </option>
    <option value="05:00am-06:00am">05:00am-06:00am</option>
    <option value="06:30am-07:30am">06:30am-07:30am</option>
    <option value="08:00am-09:00am">08:00am-09:00am</option>
    <option value="05:00pm-06:00pm">05:00pm-06:00pm</option>
    <option value="06:30pm-07:30pm">06:30pm-07:30pm</option>
    <option value="08:00pm-09:00pm">08:00pm-09:00pm</option>
  </select>
</div>;


//to find abscend days............

const Attendance = require('./attendance.model');

// Get number of absent days for a given employee and month
const getAbsentDays = async (employeeId, month, year) => {
  // Get the first and last date of the specified month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Query the attendance records for the specified month and employee
  const attendanceRecords = await Attendance.find({
    employeeId: employeeId,
    date: {
      $gte: firstDayOfMonth,
      $lte: lastDayOfMonth
    }
  });

  // Filter out the records where the employee was present
  const absentRecords = attendanceRecords.filter(record => record.status === 'absent');

  // Return the number of absent days
  return absentRecords.length;
}
