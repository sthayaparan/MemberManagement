import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/Modal';

function setup(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const onClose = vi.fn();
  const onConfirm = vi.fn();
  render(
    <Modal isOpen title="Delete Member" onClose={onClose} onConfirm={onConfirm} confirmText="Delete" {...props}>
      <p>Body text</p>
    </Modal>
  );
  return { onClose, onConfirm, user: userEvent.setup() };
}

describe('Modal', () => {
  it('renders as an accessible dialog when open', () => {
    setup();
    expect(screen.getByRole('dialog', { name: 'Delete Member' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={false} title="X" onClose={onClose}>
        <p>hidden</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const { onClose, user } = setup();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on backdrop click but not on content click', async () => {
    const { onClose, user } = setup();
    await user.click(screen.getByText('Body text'));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not close while loading', async () => {
    const { onClose, user } = setup({ isLoading: true });
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('fires onConfirm from the confirm button', async () => {
    const { onConfirm, user } = setup();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
