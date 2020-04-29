import React from "react";
import {
  addMonths,
  eachDayOfInterval,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  format,
  isValid,
  parseISO,
  parse,
  toDate,
} from "date-fns";
import { useClickOutside } from "./useClickOutside";
import { usePrevious } from './usePrevious'

type PickerType = "single" | "range"
type PickerInput = "start" | "end"
type DatePickerState = {
  type: PickerType,
  inputValue: {
    start: string;
    end?: string;
  };
  selectedDate: {
    start?: Date;
    end?: Date;
  };
  isVisible?: boolean;
  focusedInput: PickerInput;
  numberOfMonths?: number;
  firstDatesOfMonths?: Date[];
};

enum ActionTypes {
  HANDLE_FOCUS_INPUT_START_DATE = "HANDLE_FOCUS_INPUT_START_DATE",
  HANDLE_FOCUS_INPUT_END_DATE = "HANDLE_FOCUS_INPUT_END_DATE",
  HANDLE_BULR_INPUT = "HANDLE_BULR_INPUT",
  HANDLE_CHANGE_INPUT_START_DATE = "HANDLE_CHANGE_INPUT_START_DATE",
  HANDLE_CHANGE_INPUT_END_DATE = "HANDLE_CHANGE_INPUT_END_DATE",
  HANDLE_SELECT_START_DATE = "HANDLE_SELECT_START_DATE",
  HANDLE_SELECT_END_DATE = "HANDLE_SELECT_END_DATE",
  HANDLE_RESET = "HANDLE_RESET",
  HANDLE_GO_TO_PREV_MONTH = "HANDLE_GO_TO_PREV_MONTH",
  HANDLE_GO_TO_NEXT_MONTH = "HANDLE_GO_TO_NEXT_MONTH"
}

type DatePickerAction =
  | {
      type: ActionTypes.HANDLE_RESET;
    }
  | {
      type: ActionTypes.HANDLE_FOCUS_INPUT_START_DATE;
    }
  | {
    type: ActionTypes.HANDLE_FOCUS_INPUT_END_DATE;
  }
  | {
      type: ActionTypes.HANDLE_BULR_INPUT;
    }
  | {
      type: ActionTypes.HANDLE_CHANGE_INPUT_START_DATE;
      payload: {
        value: string;
      };
    }
    | {
      type: ActionTypes.HANDLE_CHANGE_INPUT_END_DATE;
      payload: {
        value: string;
      };
    }
  | {
      type: ActionTypes.HANDLE_GO_TO_PREV_MONTH;
    }
  | {
      type: ActionTypes.HANDLE_GO_TO_NEXT_MONTH;
    }
  | {
      type: ActionTypes.HANDLE_SELECT_START_DATE;
      payload: {
        date: Date;
      };
    }
  | {
      type: ActionTypes.HANDLE_SELECT_END_DATE;
      payload: {
        date: Date;
      };
    }

type DatePickerReducerType = [
  DatePickerState,
  React.Dispatch<DatePickerAction>
];

const initialState = {
  type: "single" as PickerType,
  inputValue: {
    start: "",
    end: undefined
  },
  selectedDate: {
    start: undefined,
    end: undefined
  },
  isVisible: false,
  focusedInput: "start" as PickerInput,
  numberOfMonths: 1,
  firstDatesOfMonths: []
};

export const DatePickerContext = React.createContext([
  initialState,
  (): void => {}
] as DatePickerReducerType);

const isValidDate = (value: string) => {
  const parsed = parse(value, 'yyyy-MM-dd', new Date())
  return isValid(parsed);
}

const changeInputStartDate = ({ state, value }: { state: DatePickerState, value: string; }) => {
  const parsedValue = parseISO(value);
  const isValidStartDate = isValid(parsedValue);
  const selectedStartDate = isValidStartDate
    ? toDate(parsedValue)
    : state.selectedDate.start;
  const firstDatesOfMonths = getFirstDatesOfMonths({
    numberOfMonths: state.numberOfMonths,
    startDate: selectedStartDate
  });

  return {
    ...state,
    inputValue: {
      ...state.inputValue,
      start: value
    },
    selectedDate: {
      ...state.selectedDate,
      start: selectedStartDate
    },
    firstDatesOfMonths
  };
}

const changeInputEndDate = ({ state, value }: { state: DatePickerState, value: string; }) => {
  const parsedValue = parseISO(value);
  const isValidEndDate = isValid(parsedValue);
  const selectedEndDate = isValidEndDate
    ? toDate(parsedValue)
    : state.selectedDate.start;
  const firstDatesOfMonths = getFirstDatesOfMonths({
    numberOfMonths: state.numberOfMonths,
    startDate: selectedEndDate
  });

  return {
    ...state,
    inputValue: {
      ...state.inputValue,
      end: value
    },
    selectedDate: {
      ...state.selectedDate,
      end: selectedEndDate
    },
    firstDatesOfMonths
  };
}

export const datepickerReducer = (
  state: DatePickerState = initialState,
  action: DatePickerAction
): DatePickerState => {
  switch (action.type) {
    case ActionTypes.HANDLE_RESET:
      return {
        ...state,
        inputValue: {
          start: "",
          end: ""
        },
        selectedDate: {
          start: undefined,
          end: undefined
        }
      };
    case ActionTypes.HANDLE_FOCUS_INPUT_START_DATE:
      return {
        ...state,
        isVisible: true,
        focusedInput: "start",
      };
    case ActionTypes.HANDLE_FOCUS_INPUT_END_DATE:
      return {
        ...state,
        isVisible: true,
        focusedInput: "end",
      }
    case ActionTypes.HANDLE_BULR_INPUT:
      return {
        ...state,
        isVisible: false
      };
    case ActionTypes.HANDLE_CHANGE_INPUT_START_DATE:
      return changeInputStartDate({ state, value: action.payload.value })
    case ActionTypes.HANDLE_CHANGE_INPUT_END_DATE:
      return changeInputEndDate({ state, value: action.payload.value })
    case ActionTypes.HANDLE_SELECT_START_DATE:
      return {
        ...state,
        isVisible: state.type === "single" ? false : true,
        inputValue: {
          ...state.inputValue,
          start: format(action.payload.date, "yyyy-MM-dd")
        },
        selectedDate: {
          ...state.selectedDate,
          start: action.payload.date
        }
      };
    case ActionTypes.HANDLE_SELECT_END_DATE:
        return {
          ...state,
          isVisible: false,
          inputValue: {
            ...state.inputValue,
            end: format(action.payload.date, "yyyy-MM-dd")
          },
          selectedDate: {
            ...state.selectedDate,
            end: action.payload.date
          }
        };
    case ActionTypes.HANDLE_GO_TO_PREV_MONTH:
      const currentMonthDateForPrev = (state.firstDatesOfMonths && state.firstDatesOfMonths.length > 0) ? state?.firstDatesOfMonths[0] : new Date();
      return {
        ...state,
        firstDatesOfMonths: getFirstDatesOfMonths({
          numberOfMonths: state.numberOfMonths,
          startDate: addMonths(currentMonthDateForPrev, -1)
         })
      };
    case ActionTypes.HANDLE_GO_TO_NEXT_MONTH:
      const currentMonthDateForNext = (state.firstDatesOfMonths && state.firstDatesOfMonths.length > 0) ? state?.firstDatesOfMonths[0] : new Date();
      return {
        ...state,
        firstDatesOfMonths: getFirstDatesOfMonths({
          numberOfMonths: state.numberOfMonths,
          startDate: addMonths(currentMonthDateForNext, 1)
          })
      };
    default:
      return state;
  }
};

const getFirstDatesOfMonths = ({
  numberOfMonths = 1,
  startDate = new Date()
}: {
  numberOfMonths?: number;
  startDate?: Date;
}): Date[] => {
  return new Array(numberOfMonths)
    .fill(startDate)
    .reduce((prev, current, index) => {
      const date = addMonths(current, index);
      const firstDayOfMonth = startOfMonth(date);
      return [...prev, firstDayOfMonth];
    }, []);
};

export const DatePickerProvider: React.FC<{
  type?: PickerType;
  defaultValues: Omit<DatePickerState, "type">;
}> = ({ type = "single", defaultValues, children }) => {
  const state = {
    type,
    ...defaultValues,
    firstDatesOfMonths: getFirstDatesOfMonths({
      numberOfMonths: defaultValues.numberOfMonths
    })
  };
  const datePickerReducer = React.useReducer(datepickerReducer, state);

  return (
    <DatePickerContext.Provider value={datePickerReducer}>
      {children}
    </DatePickerContext.Provider>
  );
};

export const useDatePickerContext = () => {
  const [state, dispatch] = React.useContext(DatePickerContext);
  const startInputRef = React.useRef<HTMLElement>(null);
  const endInputRef = React.useRef<HTMLElement>(null)
  const monthsRef = React.useRef<HTMLElement>(null);

  const handleReset = () => {
    dispatch({
      type: ActionTypes.HANDLE_RESET
    });
  };
  const handleFocusInputStart = () => {
    dispatch({
      type: ActionTypes.HANDLE_FOCUS_INPUT_START_DATE
    });
  };
  const handleFocusInputEnd = () => {
    dispatch({
      type: ActionTypes.HANDLE_FOCUS_INPUT_END_DATE
    })
  }
  const handleBlur = () => {
    dispatch({
      type: ActionTypes.HANDLE_BULR_INPUT
    });
  };
  const handleChangeInputValue = ({ value, type }: { value: string, type: 'start' | 'end' }) => {
    dispatch({
      type: type === "start" ? ActionTypes.HANDLE_CHANGE_INPUT_START_DATE : ActionTypes.HANDLE_CHANGE_INPUT_END_DATE,
      payload: {
        value
      }
    });
  };
  const handleSelectDate = ({ date, type = "start" }: { date: Date, type: "start" | "end" }) => {
    dispatch({
      type: type ==="start" ? ActionTypes.HANDLE_SELECT_START_DATE : ActionTypes.HANDLE_SELECT_END_DATE,
      payload: {
        date,
      }
    });
  };
  const handleGoToPrevMonth = () => {
    dispatch({
      type: ActionTypes.HANDLE_GO_TO_PREV_MONTH
    });
  };
  const handleGoToNextMonth = () => {
    dispatch({
      type: ActionTypes.HANDLE_GO_TO_NEXT_MONTH
    });
  };

  const getMonthDays = (date: Date) =>
    eachDayOfInterval({
      start: startOfWeek(startOfMonth(date)),
      end: endOfWeek(endOfMonth(date))
    }).map((day: Date) => {
      return {
        day,
        isSameMonth: isSameMonth(day, date)
      };
    });
  const firstMonthDate = (state && state.firstDatesOfMonths) ? state?.firstDatesOfMonths[0] : new Date()

  useClickOutside<HTMLElement>({
    refs: [startInputRef, endInputRef, monthsRef],
    callback: () => handleBlur()
  });

  const prevState = usePrevious(state);
  React.useEffect(() => {
    if (state.type === "range" && endInputRef.current) {
      if (prevState && state.selectedDate.start !== prevState.selectedDate.start && state.selectedDate && isValidDate(state.inputValue.start)) {
        endInputRef.current.focus();
        handleFocusInputEnd();
      }
    }
    // eslint-disable-next-line
  }, [state.selectedDate.start])

  return {
    state,
    handleReset,
    handleFocusInputStart,
    handleFocusInputEnd,
    handleBlur,
    handleChangeInputValue,
    handleSelectDate,
    handleGoToPrevMonth,
    handleGoToNextMonth,
    getMonthDays,
    firstMonthDate,
    format,
    startInputRef,
    endInputRef,
    monthsRef,
  };
};
