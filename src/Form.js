import React, { useState, useCallback, useEffect } from "react";
import PropTypes, { any, object, element, node } from "prop-types";
import { forEach, keys } from "lodash";
import { validate, isNotValid } from "./utilities";
export const FormContext = React.createContext(null);

const Form = ({
  onSubmit,
  className,
  renderField,
  renderErrorMessage = message => (
    <div className="form-ErrorMessage">{message}</div>
  ),
  requiredErrorMessage = "This field is required",
  renderAllMessages = false,
  validateOnChange = false,
  children,
  debug = false
}) => {
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [validators, setValidators] = useState([]);

  const setError = useCallback(
    (name, errorMessage) => {
      let newErrors = {};
      newErrors[name] = errorMessage;
      setErrors(prev => ({ ...prev, ...newErrors }));
    },
    [errors]
  );

  const handleChange = useCallback(
    (name, value) => {
      let newData = {};
      newData[name] = value;
      setData(prev => ({ ...prev, ...newData }));
    },
    [data]
  );

  const handleErrorMessage = (typeOfValidator, errorMessages) => {
    const errorMessage = errorMessages[typeOfValidator];
    switch (typeOfValidator) {
      case "required":
        return requiredErrorMessage;
      default:
        return errorMessage
          ? errorMessage
          : `Default error message of type ${typeOfValidator}`;
    }
  };

  const handleValidators = (fieldValidators, fieldName, errorMessages) => {
    let validated = true;
    forEach(fieldValidators, (rule, typeOfValidator) => {
      if (!validate(data[fieldName], rule, typeOfValidator)) {
        setError(fieldName, handleErrorMessage(typeOfValidator, errorMessages));
        validated = false;
        return false;
      }
    });
    return validated;
  };

  const handleAllValidators = useCallback(
    validators => {
      let validated = true;
      console.log(validators);
      forEach(validators, validatorObject => {
        const fieldName = validatorObject.name;
        const fieldValidators = validatorObject.validators;
        const errorMessages = validatorObject.messages;
        const validated = handleValidators(
          fieldValidators,
          fieldName,
          errorMessages
        );
        if (!validated && !renderAllMessages) {
          return false;
        }
      });

      return validated;
    },
    [data]
  );

  const handleSubmit = useCallback(
    e => {
      // Clear errors.
      setErrors({});

      // Prevent the from from refreshing.
      e.preventDefault();

      // Check and handle all validators.
      const validated = handleAllValidators(validators);

      // Pass the data to the onSubmit prop if there is no errors.
      if (validated) {
        console.log(data);
      }
    },
    [errors, data]
  );

  /**
   * Lets Field components register their validators
   *
   */
  const register = validatorObject => {
    setValidators(prev => [...prev, validatorObject]);
  };

  const formContextValues = {
    onChange: handleChange,
    data,
    errors,
    setError,
    clearErrors: () => setErrors({}),
    validators,
    validateOnChange,
    handleValidators,
    register,
    renderErrorMessage
  };

  // Debug the changes on the data.
  useEffect(() => {
    if (debug) {
      console.log(data);
    }
  }, [data]);

  return (
    <FormContext.Provider value={formContextValues}>
      <form
        onSubmit={handleSubmit}
        className={["form-MainForm", className].join(" ")}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

Form.propTypes = {
  onSubmit: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
  debug: PropTypes.bool,
  renderField: PropTypes.func,
  renderErrorMessage: PropTypes.func,
  requiredErrorMessage: PropTypes.string,
  renderAllMessages: PropTypes.bool,
  validateOnChange: PropTypes.bool
};

export default Form;