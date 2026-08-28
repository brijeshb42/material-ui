import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { spy } from 'sinon';
import { SxProps } from '@mui/material/styles';

import mergeSlotProps from './mergeSlotProps';

type OwnerState = {
  className: string;
  'aria-label'?: string;
  style?: React.CSSProperties;
};

describe('utils/index.js', () => {
  describe('mergeSlotProps', () => {
    it('external slot props is undefined', () => {
      expect(
        mergeSlotProps<OwnerState>(undefined, {
          className: 'default',
          'aria-label': 'foo',
        }),
      ).to.deep.equal({
        className: 'default',
        'aria-label': 'foo',
      });
    });

    it('merge styles', () => {
      expect(
        mergeSlotProps<{ style: React.CSSProperties }>(
          { style: { color: 'red' } },
          { style: { backgroundColor: 'blue' } },
        ),
      ).to.deep.equal({
        style: { color: 'red', backgroundColor: 'blue' },
      });

      // external styles should override
      expect(
        mergeSlotProps<{ style: React.CSSProperties }>(
          { style: { backgroundColor: 'red' } },
          { style: { backgroundColor: 'blue' } },
        ),
      ).to.deep.equal({
        style: { backgroundColor: 'red' },
      });
    });

    it('merge sx', () => {
      expect(
        mergeSlotProps<{ sx: SxProps }>(
          { sx: { color: 'red' } },
          { sx: { backgroundColor: 'blue' } },
        ),
      ).to.deep.equal({
        sx: [{ backgroundColor: 'blue' }, { color: 'red' }],
      });
    });

    it('merge sx array', () => {
      expect(
        mergeSlotProps<{ sx: SxProps }>(
          { sx: [{ color: 'red', '&.Mui-disabled': { opacity: 0 } }] },
          { sx: [{ backgroundColor: 'blue', '&.Mui-disabled': { opacity: 0.5 } }] },
        ),
      ).to.deep.equal({
        sx: [
          { backgroundColor: 'blue', '&.Mui-disabled': { opacity: 0.5 } },
          { color: 'red', '&.Mui-disabled': { opacity: 0 } },
        ],
      });
    });

    it('external slot props should override', () => {
      expect(
        mergeSlotProps<OwnerState>(
          { className: 'external', 'aria-label': 'bar' },
          { className: 'default', 'aria-label': 'foo' },
        ),
      ).to.deep.equal({
        className: 'default external',
        'aria-label': 'bar',
      });
    });

    it('external slot props is a function', () => {
      expect(
        mergeSlotProps<(ownerState: OwnerState) => OwnerState, OwnerState>(
          () => ({
            className: 'external',
          }),
          { className: 'default', 'aria-label': 'foo' },
        )({ className: '' }),
      ).to.deep.equal({
        className: 'default external',
        'aria-label': 'foo',
      });
    });

    it('default slot props is a function', () => {
      expect(
        mergeSlotProps<OwnerState, (ownerState: OwnerState) => OwnerState>(
          {
            className: 'external',
          },
          () => ({ className: 'default', 'aria-label': 'foo' }),
        )({ className: 'base' }),
      ).to.deep.equal({
        className: 'base default external',
        'aria-label': 'foo',
      });
    });

    it('both slot props are functions', () => {
      expect(
        mergeSlotProps<(ownerState: OwnerState) => OwnerState>(
          () => ({
            className: 'external',
          }),
          () => ({
            className: 'default',
            'aria-label': 'foo',
          }),
        )({ className: 'base' }),
      ).to.deep.equal({
        className: 'base default external',
        'aria-label': 'foo',
      });
    });

    it('merge styles for callbacks', () => {
      expect(
        mergeSlotProps(
          () => ({
            style: { color: 'red' },
          }),
          () => ({
            style: { backgroundColor: 'blue' },
          }),
        )(),
      ).to.deep.equal({
        style: { color: 'red', backgroundColor: 'blue' },
      });

      // external styles should override
      expect(
        mergeSlotProps(
          () => ({
            style: { backgroundColor: 'red' },
          }),
          () => ({
            style: { backgroundColor: 'blue' },
          }),
        )(),
      ).to.deep.equal({
        style: { backgroundColor: 'red' },
      });
    });

    it('merge sx for callback', () => {
      expect(
        mergeSlotProps(
          () => ({
            sx: { color: 'red' },
          }),
          () => ({
            sx: { backgroundColor: 'blue' },
          }),
        )(),
      ).to.deep.equal({
        sx: [{ backgroundColor: 'blue' }, { color: 'red' }],
      });
    });

    it('merge sx array for callback', () => {
      expect(
        mergeSlotProps(
          () => ({ sx: [{ color: 'red', '&.Mui-disabled': { opacity: 0 } }] }),
          () => ({ sx: [{ backgroundColor: 'blue', '&.Mui-disabled': { opacity: 0.5 } }] }),
        )(),
      ).to.deep.equal({
        sx: [
          { backgroundColor: 'blue', '&.Mui-disabled': { opacity: 0.5 } },
          { color: 'red', '&.Mui-disabled': { opacity: 0 } },
        ],
      });
    });

    it('external callback should be called with default slot props', () => {
      expect(
        mergeSlotProps<(ownerState: OwnerState) => OwnerState>(
          ({ 'aria-label': ariaLabel }) => ({
            className: 'external',
            'aria-label': ariaLabel === 'foo' ? 'bar' : 'baz',
          }),
          () => ({
            className: 'default',
            'aria-label': 'foo',
          }),
        )({ className: 'base', 'aria-label': 'unknown' }),
      ).to.deep.equal({
        className: 'base default external',
        'aria-label': 'bar',
      });
    });

    it('automatically merge function based on the default slot props', () => {
      const slotPropsOnClick = spy();
      const defaultPropsOnClick = spy();

      const defaultPropsOnChange = spy();

      const slotPropsFoo = spy();
      const defaultPropsFoo = spy();

      const mergedSlotProps = mergeSlotProps<{
        onClick: (arg1: string, arg2: string) => string;
        onChange?: (arg1: string, arg2: string) => string;
        foo: (arg1: string, arg2: string) => string;
      }>(
        {
          onClick: slotPropsOnClick,
          foo: slotPropsFoo,
        },
        {
          onClick: defaultPropsOnClick,
          onChange: defaultPropsOnChange,
          foo: defaultPropsFoo,
        },
      );

      mergedSlotProps.onClick('arg1', 'arg2');
      expect(defaultPropsOnClick.callCount).to.equal(1);
      expect(defaultPropsOnClick.args[0]).to.deep.equal(['arg1', 'arg2']);
      expect(slotPropsOnClick.callCount).to.equal(1);
      expect(slotPropsOnClick.args[0]).to.deep.equal(['arg1', 'arg2']);

      mergedSlotProps.onChange?.('arg1', 'arg2');
      expect(defaultPropsOnChange.callCount).to.equal(1);
      expect(defaultPropsOnChange.args[0]).to.deep.equal(['arg1', 'arg2']);

      mergedSlotProps.foo('arg1', 'arg2');
      expect(defaultPropsFoo.callCount).to.equal(0);
      expect(slotPropsFoo.callCount).to.equal(1);
      expect(slotPropsFoo.args[0]).to.deep.equal(['arg1', 'arg2']);
    });

    describe('ref composition', () => {
      it('composes two object refs so both receive the element (static path)', () => {
        const internalRef: React.MutableRefObject<HTMLDivElement | null> = { current: null };
        const externalRef: React.MutableRefObject<HTMLDivElement | null> = { current: null };

        const merged = mergeSlotProps<{ ref: React.Ref<HTMLDivElement> }>(
          { ref: externalRef },
          { ref: internalRef },
        );

        const fakeEl = document.createElement('div') as HTMLDivElement;
        (merged as any).ref(fakeEl);

        expect(internalRef.current).to.equal(fakeEl);
        expect(externalRef.current).to.equal(fakeEl);
      });

      it('composes two callback refs so both are called (static path)', () => {
        const internalCb = spy();
        const externalCb = spy();

        const merged = mergeSlotProps<{ ref: React.RefCallback<HTMLDivElement> }>(
          { ref: externalCb },
          { ref: internalCb },
        );

        const fakeEl = document.createElement('div') as HTMLDivElement;
        (merged as any).ref(fakeEl);

        expect(internalCb.callCount).to.equal(1);
        expect(internalCb.args[0][0]).to.equal(fakeEl);
        expect(externalCb.callCount).to.equal(1);
        expect(externalCb.args[0][0]).to.equal(fakeEl);
      });

      it('composes two object refs so both receive the element (function path)', () => {
        const internalRef: React.MutableRefObject<HTMLDivElement | null> = { current: null };
        const externalRef: React.MutableRefObject<HTMLDivElement | null> = { current: null };

        const merged = mergeSlotProps<
          (ownerState: OwnerState) => { ref: React.Ref<HTMLDivElement> },
          { ref: React.Ref<HTMLDivElement> }
        >(
          () => ({ ref: externalRef }),
          { ref: internalRef },
        )({ className: '' });

        const fakeEl = document.createElement('div') as HTMLDivElement;
        (merged as any).ref(fakeEl);

        expect(internalRef.current).to.equal(fakeEl);
        expect(externalRef.current).to.equal(fakeEl);
      });

      it('composes two callback refs so both are called (function path)', () => {
        const internalCb = spy();
        const externalCb = spy();

        const merged = mergeSlotProps<
          (ownerState: OwnerState) => { ref: React.RefCallback<HTMLDivElement> },
          { ref: React.RefCallback<HTMLDivElement> }
        >(
          () => ({ ref: externalCb }),
          { ref: internalCb },
        )({ className: '' });

        const fakeEl = document.createElement('div') as HTMLDivElement;
        (merged as any).ref(fakeEl);

        expect(internalCb.callCount).to.equal(1);
        expect(internalCb.args[0][0]).to.equal(fakeEl);
        expect(externalCb.callCount).to.equal(1);
        expect(externalCb.args[0][0]).to.equal(fakeEl);
      });
    });
  });
});
