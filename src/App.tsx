import * as React from "react";
import { Formik, useFormikContext } from "formik";
import { DatePickerProvider, useDatePickerContext } from "./DatePickerContext";

const Month: React.FC<{
  firstDate: Date;
}> = ({ firstDate }) => {
  const { setFieldValue } = useFormikContext();

  const {
    state,
    getMonthDays,
    format,
    handleSelectDate,
  } = useDatePickerContext();
  const days = getMonthDays(firstDate);
  const selectDate = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.persist();
    const { date } = e.currentTarget.dataset;
    handleSelectDate({
      date: new Date(date as string),
      type: state.focusedInput,
    });
    setFieldValue(state.focusedInput, date);
  };

  return (
    <div>
      <h3>{format(firstDate, "MM")}</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)"
        }}
      >
        {days.map((day: { day: Date }) => (
          <div key={day.day.toDateString()}>
            <div
              style={{
                cursor: "pointer"
              }}
              role="button"
              onClick={selectDate}
              data-date={day.day.toDateString()}
            >
              {format(day.day, "dd")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DatePickerField = () => {
  const { setFieldValue, values } = useFormikContext<{
    start: string;
    end: string;
  }>();
  const {
    state,
    handleFocusInputStart,
    handleFocusInputEnd,
    handleReset,
    handleChangeInputValue,
    handleGoToPrevMonth,
    handleGoToNextMonth,
    firstMonthDate,
    startInputRef,
    endInputRef,
    monthsRef
  } = useDatePickerContext();
  const goToPrevMonth = () => {
    handleGoToPrevMonth();
  }
  const goToNextMonth = () => {
    handleGoToNextMonth();
  }
  const changeStartInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    handleChangeInputValue({ value: value, type: "start" });
    setFieldValue("start", value);
  };
  const changeEndInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    handleChangeInputValue({ value: value, type: "end" });
    setFieldValue("end", value);
  };
  
  React.useEffect(() => {
    if (!values.start) {
      handleReset();
    }
    // eslint-disable-next-line
  }, [values.start]);
  React.useEffect(() => {
    if (!values.end) {
      handleReset();
    }
    // eslint-disable-next-line
  }, [values.end]);

  return (
    <div>
      <input
        ref={startInputRef as any}
        type="text"
        value={state.inputValue.start}
        onChange={changeStartInputValue}
        onFocus={handleFocusInputStart}
      />
      <input
        ref={endInputRef as any}
        type="text"
        value={state.inputValue.end}
        onChange={changeEndInputValue}
        onFocus={handleFocusInputEnd}
      />
      {state.isVisible && (
        <div ref={monthsRef as any}>
          <button type="button" onClick={ goToPrevMonth }>prev</button>
          <button type="button" onClick={ goToNextMonth }>next</button>
          <div>
            <div>
              { firstMonthDate.getFullYear() }
              /
              { firstMonthDate.getMonth() + 1 }
            </div>
            {state?.firstDatesOfMonths?.map(day => (
              <Month key={day.toDateString()} firstDate={day} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      <Formik
        enableReinitialize
        initialValues={{
          start: "",
          end: "",
        }}
        onSubmit={values => {
          console.log(values);
        }}
      >
        {({ values, handleSubmit, handleReset }) => (
          <form onSubmit={handleSubmit}>
            <DatePickerProvider
              type="range"
              defaultValues={{
                inputValue: {
                  start: values.start,
                  end: values.end,
                },
                selectedDate: {
                  start: undefined,
                  end: undefined
                },
                numberOfMonths: 2,
                isVisible: false
              }}
            >
              <DatePickerField />
            </DatePickerProvider>
            <button type="submit">submit</button>
            <button type="button" onClick={handleReset}>
              reset
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
}
