import { createField } from "../src/builder/FieldElement";
import { createContainer } from "../src/builder/ContainerElement";
import TestRenderer from "react-test-renderer";
import { Form } from "../src";
import { GenericContainer } from "../src";
import { GenericField } from "../src";
import React from "react";

describe("Field Element", () => {
  it("Field validator works as an object", () => {
    let field = createField(null, "someName");
    field.setValidator((value, setError) => {
      if (value == "error") {
        setError("There is an error");
      }
    });
    // Check with a correct value.
    field.validate("not error");
    expect(field.hasError()).toEqual(false);
    // Check with an incorrect value.
    field.validate("error");
    expect(field.hasError()).toEqual(true);
    // Check if the message is right.
    expect(field.getErrorMessage()).toEqual("There is an error");
  });

  it("Field validator works in a form", () => {
    let submitted = false;

    let mainContainer = createContainer(GenericContainer).setLabel(
      "My Container"
    );
    let field1 = createField(GenericField, "normalField");
    let field2 = createField(GenericField, "customRequiredField").setValidator(
      (value, setError) => {
        if (value == "error value") {
          setError("There is an error");
        }
      }
    );
    mainContainer.addFields(field1, field2);

    const form = TestRenderer.create(
      <Form onSubmit={value => (submitted = true)} fields={mainContainer} />
    );
    const instance = form.getInstance();
    instance.handleChange("some value", "normalField");
    instance.handleSubmit();
    expect(submitted).toEqual(true);
    instance.handleChange("error value", "customRequiredField");
    submitted = false;
    instance.handleSubmit();
    expect(submitted).toEqual(false);
    instance.handleChange("success value", "customRequiredField");
    instance.handleSubmit();
    expect(submitted).toEqual(true);
  });

  it("Field dependency works", () => {
    let dependentField = createField(null, "dependent");
    dependentField.setDependency("dependency");
    dependentField.setLabel("My {dependency}");
    dependentField.replaceDependencies("Field");
    expect(dependentField.getLabel()).toEqual("My Field");
  });
});

describe("Form", () => {
  let mainContainer = createContainer(GenericContainer).setLabel(
    "My Container"
  );
  let field1 = createField(GenericField, "field1");
  let field2 = createField(GenericField, "field2")
    .setLabel("Test")
    .setRequired();
  mainContainer.addFields(field1, field2);

  it("Render the main container with 2 fields", () => {
    const form = TestRenderer.create(
      <Form onSubmit={values => (submitted = true)} fields={mainContainer} />
    );
    expect(form.toJSON().children[1].children.length).toEqual(2);
  });
  it("Should not submit when there is a field that is required but empty", () => {
    const form = TestRenderer.create(
      <Form onSubmit={values => (submitted = true)} fields={mainContainer} />
    );
    let submitted = false;
    const instance = form.getInstance();
    instance.handleSubmit();
    expect(submitted).toEqual(false);
  });
  it("Should submit if every required field is satisfied", () => {
    const form = TestRenderer.create(
      <Form onSubmit={values => (submitted = true)} fields={mainContainer} />
    );
    let submitted = false;
    const instance = form.getInstance();
    instance.handleChange("some value", "field2");
    instance.handleSubmit();
    expect(submitted).toEqual(true);
  });

  it("Data should change as expected", () => {
    const form = TestRenderer.create(
      <Form onSubmit={values => (submitted = true)} fields={mainContainer} />
    );
    const instance = form.getInstance();
    instance.handleChange("some value", "field1");
    expect(instance.state.data).toEqual({ field1: "some value" });
    instance.handleChange("other value", "field2");
    expect(instance.state.data).toEqual({
      field1: "some value",
      field2: "other value"
    });
  });
});
